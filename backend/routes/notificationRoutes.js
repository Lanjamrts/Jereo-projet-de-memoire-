const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// Récupérer les notifications d'un utilisateur (par email)
router.get("/:email", async (req, res) => {
  try {
    const notifs = await Notification.find({
      emailSignaleur: req.params.email,
      deleted: false,
    }).sort({ createdAt: -1 });
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Marquer une notification comme lue
router.put("/:id/read", async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { status: "lu" },
      { new: true }
    );
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Marquer une notification comme supprimée (mais garder en DB)
router.put("/:id/delete", async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;