import mongoose from "mongoose";

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
  autoriteId: { type: mongoose.Schema.Types.ObjectId, ref: "Autorite", required: true }
});

export default mongoose.model("Signaler", signalerSchema);
