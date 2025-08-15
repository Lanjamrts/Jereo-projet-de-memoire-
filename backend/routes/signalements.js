const express = require("express");
const Signaler = require("../models/Signaler");
const { auth, requireRole } = require("../middlewares/auth");

const router = express.Router();

// GET : Liste des signalements
router.get("/", auth, async (req, res) => {
  try {
    const { status, search, sort = "desc", autoriteId } = req.query;

    const q = {};
    if (status && status !== "Tous") q.status = status;
    if (search) q.description = { $regex: search, $options: "i" };
    if (autoriteId) q.autoriteId = autoriteId;

    if (req.user.role === "autorite" && !autoriteId) {
      if (!req.user.autoriteId) return res.json({ data: [], total: 0 });
      q.autoriteId = req.user.autoriteId;
    }

    const data = await Signaler.find(q)
      .populate("autoriteId")
      .sort({ dateSignalement: sort === "asc" ? 1 : -1 });

    res.json({ data, total: data.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT : Modifier description
router.put("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const { description } = req.body;
    const sig = await Signaler.findById(req.params.id);
    if (!sig) return res.status(404).json({ message: "Signalement introuvable" });

    sig.description = description || sig.description;
    await sig.save();
    res.json(sig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE : Supprimer signalement
router.delete("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const sig = await Signaler.findById(req.params.id);
    if (!sig) return res.status(404).json({ message: "Signalement introuvable" });

    await sig.deleteOne();
    res.json({ message: "Signalement supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
