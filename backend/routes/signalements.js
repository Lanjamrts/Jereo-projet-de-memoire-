const express = require("express");
const Signaler = require("../models/Signaler");
const { auth, requireRole } = require("../middlewares/auth");

const router = express.Router();

/**
 * GET /api/signalements
 * Query: status, search, page, limit, sort (desc|asc), autoriteId (optionnel)
 * Rôle: admin voit tout, autorité peut voir tout ou seulement pour son autoriteId (à toi de choisir)
 */
router.get("/", auth, async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      sort = "desc",
      autoriteId
    } = req.query;

    const q = {};
    if (status && status !== "Tous") q.status = status;
    if (search) q.description = { $regex: search, $options: "i" };
    if (autoriteId) q.autoriteId = autoriteId;

    // Si l'utilisateur est autorité et n'a pas passé autoriteId, on force son autoriteId
    if (req.user.role === "autorite" && !autoriteId) {
      if (!req.user.autoriteId) return res.json({ data: [], total: 0 });
      q.autoriteId = req.user.autoriteId;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Signaler.countDocuments(q);
    const data = await Signaler.find(q)
      .populate("autoriteId")
      .sort({ dateSignalement: sort === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/signalements/:id/status
 * body: { status: "En attente" | "Pris en charge" | "Resolu" }
 * Rôle: admin / autorite
 */
router.put("/:id/status", auth, requireRole("admin", "autorite"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["En attente", "Pris en charge", "Resolu"].includes(status)) {
      return res.status(400).json({ message: "Status invalide" });
    }

    const sig = await Signaler.findById(req.params.id);
    if (!sig) return res.status(404).json({ message: "Signalement introuvable" });

    // Optionnel: si role=autorite, vérifier que le signalement correspond à son autoriteId
    if (req.user.role === "autorite" && String(sig.autoriteId) !== String(req.user.autoriteId)) {
      return res.status(403).json({ message: "Non autorisé pour ce signalement" });
    }

    sig.status = status;
    await sig.save();
    res.json(sig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
