const mongoose = require("mongoose");

const autoriteSchema = new mongoose.Schema({
  nom: { type: String, required: true }
});

module.exports = mongoose.model("Autorite", autoriteSchema);
