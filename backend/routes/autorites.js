import express from "express";
import Autorite from "../models/Autorite.js";

const router = express.Router();

// Récupérer toutes les autorités
router.get("/", async (req, res) => {
  try {
    const autorites = await Autorite.find();
    res.json(autorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
