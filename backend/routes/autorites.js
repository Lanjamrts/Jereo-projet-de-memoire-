const express = require("express");
const Autorite = require("../models/Autorite");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const autorites = await Autorite.find();
    res.json(autorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
