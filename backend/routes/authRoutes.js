const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { 
  register, 
  login, 
  updateProfile, 
  changePassword, 
  upload, 
  updateProfilePicture,
  deleteProfilePicture
} = require("../controllers/auth.controller");
const { auth } = require("../middlewares/auth");

router.post("/register", upload.single('profilePicture'), register);
router.post("/login", login);
router.put("/profile", auth, updateProfile);
router.put("/profile-picture", auth, upload.single('profilePicture'), updateProfilePicture);
router.delete("/profile-picture", auth, deleteProfilePicture);
router.put("/change-password", auth, changePassword);

// Nouvelle route pour récupérer le profil par email
router.get("/profile-by-email/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email })
      .select("firstName lastName profilePicture email");
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

module.exports = router;