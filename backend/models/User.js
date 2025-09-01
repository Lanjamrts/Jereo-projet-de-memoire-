const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    birthDate: { type: Date, required: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },
    profilePicture: { type: String, default: null }, // Champ pour la photo de profil

    // role
    role: {
      type: String,
      enum: ["user", "autorite", "admin"],
      default: "user",
      required: true,
    },

    // si role = autorite, on relie à la collection Autorite
    autoriteId: { type: mongoose.Schema.Types.ObjectId, ref: "Autorite", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);