const mongoose = require("mongoose");

const signalerSchema = new mongoose.Schema({
  lieux: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  status: { type: String, default: "En attente" },
  dateSignalement: { type: Date, default: Date.now },
  emailSignaleur: { type: String, required: true },
  nomSignaleur: { type: String, required: true },
  autoriteId: { type: mongoose.Schema.Types.ObjectId, ref: "Autorite", required: true },
  // Nouveau champ pour la référence à l'utilisateur
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model("Signaler", signalerSchema);