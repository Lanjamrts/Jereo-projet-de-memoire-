const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// Connexion MongoDB
connectDB();

// --- Routes ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/autorites", require("./routes/autorites"));
app.use("/api/signaler", require("./routes/signalerRoute"));
app.use("/api/signalements", require("./routes/signalements"));
app.use("/api/admin/users", require("./routes/admin.users"));
app.use("/api/notifications", require("./routes/notificationRoutes")); // <--- ajouté

// Dossier public
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Création serveur HTTP + Socket.IO ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // en dev, tout est autorisé
  },
});

// Associer socket <-> email utilisateur
let userSockets = {};

io.on("connection", (socket) => {
  console.log("🔌 Un client est connecté :", socket.id);

  // Le client s’enregistre avec son email
  socket.on("register", (email) => {
    userSockets[email] = socket.id;
    console.log(`✅ Utilisateur ${email} enregistré sur socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket déconnecté :", socket.id);
    Object.keys(userSockets).forEach(email => {
      if (userSockets[email] === socket.id) delete userSockets[email];
    });
  });
});

// Fonction pour envoyer une notif en temps réel
const sendNotification = (email, notif) => {
  const socketId = userSockets[email];
  if (socketId) {
    io.to(socketId).emit("notification", notif);
  }
};

app.set("sendNotification", sendNotification);

// Serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
