const express = require("express");
const multer = require("multer");
const Signaler = require("../models/Signaler");
const Notification = require("../models/Notification");

const router = express.Router();

// Configurer Multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Ajouter un nouveau signalement
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { description, latitude, longitude, autoriteId, emailSignaleur, nomSignaleur } = req.body;

    const signalement = new Signaler({
      lieux: { latitude, longitude },
      description,
      imageUrl: `/uploads/${req.file.filename}`,
      emailSignaleur,
      nomSignaleur,
      autoriteId
    });

    await signalement.save();

    // Créer une notification de confirmation pour l'utilisateur
    const notif = await Notification.create({
      emailSignaleur: emailSignaleur,
      signalementId: signalement._id,
      autoriteName: "Système Jereo",
      imageUrl: `/uploads/${req.file.filename}`,
      message: "Votre signalement a été envoyé avec succès et est en cours de traitement."
    });

    // Envoyer la notification en temps réel
    const sendNotification = req.app.get("sendNotification");
    sendNotification(emailSignaleur, notif);

    res.status(201).json(signalement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Récupérer tous les signalements
router.get("/", async (req, res) => {
  try {
    const signalements = await Signaler.find().populate("autoriteId");
    res.json(signalements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;