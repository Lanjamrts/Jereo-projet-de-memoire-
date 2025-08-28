const express = require("express");
const Signaler = require("../models/Signaler");
const { auth, requireRole } = require("../middlewares/auth");
const Notification = require("../models/Notification");

const router = express.Router();

// GET : Liste des signalements
router.get("/", auth, async (req, res) => {
  try {
    const { status, search, sort = "desc", autoriteId, page = 1, limit = 10 } = req.query;

    const q = {};
    if (status && status !== "Tous") q.status = status;
    if (search) q.description = { $regex: search, $options: "i" };
    if (autoriteId) q.autoriteId = autoriteId;

    if (req.user.role === "autorite" && !autoriteId) {
      if (!req.user.autoriteId) return res.json({ data: [], total: 0 });
      q.autoriteId = req.user.autoriteId;
    }

    const skip = (page - 1) * limit;
    
    const data = await Signaler.find(q)
      .populate("autoriteId")
      .sort({ dateSignalement: sort === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Signaler.countDocuments(q);

    res.json({ data, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT : Modifier description
router.put("/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const { description } = req.body;
    const sig = await Signaler.findById(req.params.id);
    if (!sig)
      return res.status(404).json({ message: "Signalement introuvable" });

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
    if (!sig)
      return res.status(404).json({ message: "Signalement introuvable" });

    await sig.deleteOne();
    res.json({ message: "Signalement supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT : Modifier le statut
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status, message } = req.body;
    const sig = await Signaler.findById(req.params.id);
    if (!sig)
      return res.status(404).json({ message: "Signalement introuvable" });

    // Autorité peut modifier le status seulement de SES signalements
    if (req.user.role === "autorite") {
      if (
        !sig.autoriteId ||
        sig.autoriteId.toString() !== req.user.autoriteId.toString()
      ) {
        return res.status(403).json({ message: "Non autorisé" });
      }
    }

    sig.status = status || sig.status;
    await sig.save();

    // Créer une notification
    const notif = await Notification.create({
      emailSignaleur: sig.emailSignaleur,
      signalementId: sig._id,
      autoriteName: req.user.firstName + " " + req.user.lastName,
      imageUrl: sig.imageUrl,
      message: message || `Votre signalement a été ${status.toLowerCase()}`,
    });

    // Envoyer au frontend en temps réel
    const sendNotification = req.app.get("sendNotification");
    sendNotification(sig.emailSignaleur, notif);

    res.json(sig);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;