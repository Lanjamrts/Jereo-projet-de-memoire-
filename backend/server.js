const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// Connexion MongoDB
connectDB();

// --- Routes ---
app.use("/api/auth", require("./routes/authRoutes"));        // Authentification
app.use("/api/autorites", require("./routes/autorites"));
// app.use("/api/signalements", require("./routes/signalementRoute"));
app.use("/api/signaler", require("./routes/signalerRoute")); // Créer un signalement

// --- Dossier pour les images uploadées ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT} 🚀`));
