const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  emailSignaleur: { type: String, required: true },
  signalementId: { type: mongoose.Schema.Types.ObjectId, ref: "Signaler", required: true },
  autoriteName: { type: String, required: true },
  imageUrl: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["non_lu", "lu"], default: "non_lu" },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);