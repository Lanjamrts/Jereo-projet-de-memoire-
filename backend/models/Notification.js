const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  emailSignaleur: { type: String, required: true }, // utilisateur concerné
  signalementId: { type: mongoose.Schema.Types.ObjectId, ref: "Signaler", required: true },
  autoriteName: { type: String, required: true }, // nom de l’autorité qui change le statut
  imageUrl: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["non_lu", "lu"], default: "non_lu" },
  deleted: { type: Boolean, default: false }, // pour marquer comme supprimée côté utilisateur
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
