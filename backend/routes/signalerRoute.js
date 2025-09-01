// backend/routes/signalerRoute.js
const express = require("express");
const multer = require("multer");
const Signaler = require("../models/Signaler");
const Notification = require("../models/Notification");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Configurer Multer pour les signalements
const storageSignalements = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const uploadSignalement = multer({ 
  storage: storageSignalements,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max pour les photos de signalements
  }
});

// Ajouter un nouveau signalement
router.post("/", uploadSignalement.single("image"), async (req, res) => {
  try {
    console.log("Fichier reçu:", req.file);
    console.log("Données reçues:", req.body);

    const { description, latitude, longitude, autoriteId, emailSignaleur, nomSignaleur } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Aucune image fournie" });
    }

    const signalement = new Signaler({
      lieux: { 
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude) 
      },
      description,
      imageUrl: `/uploads/${req.file.filename}`,
      emailSignaleur,
      nomSignaleur,
      autoriteId
    });

    await signalement.save();

    // Créer une notification de confirmation
    const notif = new Notification({
      emailSignaleur: emailSignaleur,
      signalementId: signalement._id,
      autoriteId: autoriteId,
      imageUrl: `/uploads/${req.file.filename}`,
      message: "Votre signalement a été envoyé avec succès et est en cours de traitement."
    });

    await notif.save();

    // Envoyer la notification en temps réel
    const sendNotification = req.app.get("sendNotification");
    if (sendNotification) {
      sendNotification(emailSignaleur, notif);
    }

    res.status(201).json(signalement);
  } catch (err) {
    console.error("Erreur lors de l'envoi du signalement:", err);
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