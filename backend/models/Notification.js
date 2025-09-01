// backend/models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  emailSignaleur: { type: String, required: true },
  signalementId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Signaler", 
    required: true 
  },
  autoriteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Autorite',
    required: true
  },
  imageUrl: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["non_lu", "lu"], 
    default: "non_lu" 
  },
  deleted: { 
    type: Boolean, 
    default: false 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Notification", notificationSchema);