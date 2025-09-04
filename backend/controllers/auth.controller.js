const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration de multer pour le stockage des images (déclarée une seule fois)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profile-pictures';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtre pour n'accepter que les images (déclarée une seule fois)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

exports.upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, birthDate, email, password, role, autoriteId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Utilisateur déjà existant" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Gérer l'image de profil si elle est fournie
    let profilePicture = null;
    if (req.file) {
      profilePicture = req.file.path;
    }

    const newUser = await User.create({
      firstName,
      lastName,
      birthDate,
      email,
      password: hashedPassword,
      profilePicture,
      role: role || "user",
      autoriteId: role === "autorite" ? autoriteId || null : null
    });

    res.status(201).json({ message: "Utilisateur créé avec succès", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("autoriteId");
    if (!user) return res.status(400).json({ message: "Email ou mot de passe incorrect" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Email ou mot de passe incorrect" });

    const token = jwt.sign(
      { id: user._id, role: user.role, autoriteId: user.autoriteId?._id || null },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
        autorite: user.autoriteId ? { id: user.autoriteId._id, nom: user.autoriteId.nom } : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, birthDate, email } = req.body;
    const userId = req.user.id;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, birthDate, email },
      { new: true }
    ).select("-password");

    res.status(200).json({ 
      message: "Profil mis à jour avec succès", 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    // Vérifier si un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({ message: "Aucune image fournie" });
    }

    const profilePicture = req.file.path;

    // Trouver l'utilisateur pour obtenir le chemin de l'ancienne image
    const user = await User.findById(userId);
    if (user && user.profilePicture) {
      // Supprimer l'ancienne image du système de fichiers
      const oldFilePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture },
      { new: true }
    ).select("-password");

    res.status(200).json({ 
      message: "Photo de profil mise à jour avec succès", 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    // Trouver l'utilisateur pour obtenir le chemin de l'image actuelle
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Si l'utilisateur a une photo de profil, la supprimer du système de fichiers
    if (user.profilePicture) {
      // Chemin complet du fichier
      const filePath = path.join(__dirname, '..', user.profilePicture);
      
      // Vérifier si le fichier existe et le supprimer
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Mettre à jour l'utilisateur pour supprimer la référence à la photo
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: null },
      { new: true } 
    ).select("-password");

    res.status(200).json({ 
      message: "Photo de profil supprimée avec succès", 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect" });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};