const express = require("express");
const User = require("../models/User");
const { auth, requireRole } = require("../middlewares/auth");

const router = express.Router();

// Liste paginée des users
router.get("/", auth, requireRole("admin"), async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const q = {};
  if (search) {
    q.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName:  { $regex: search, $options: "i" } },
      { email:     { $regex: search, $options: "i" } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(q);
  const data = await User.find(q)
    .select("-password")
    .populate("autoriteId") // Populate autoriteId pour avoir les infos de l'autorité
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });
  res.json({ data, total, page: Number(page), limit: Number(limit) });
});

// Update role (et autoriteId si besoin)
router.put("/:id/role", auth, requireRole("admin"), async (req, res) => {
  const { role, autoriteId } = req.body;
  if (!["user", "autorite", "admin"].includes(role)) {
    return res.status(400).json({ message: "Rôle invalide" });
  }
  const update = { role };
  if (role === "autorite") update.autoriteId = autoriteId || null;
  else update.autoriteId = null;

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
    .select("-password")
    .populate("autoriteId");
  if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
  res.json(user);
});

// Delete user
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;