const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  updateProfile, 
  changePassword, 
  upload, 
  updateProfilePicture,
  deleteProfilePicture // Fonction ajoutée
} = require("../controllers/auth.controller");
const { auth } = require("../middlewares/auth");

router.post("/register", upload.single('profilePicture'), register);
router.post("/login", login);
router.put("/profile", auth, updateProfile);
router.put("/profile-picture", auth, upload.single('profilePicture'), updateProfilePicture);
router.delete("/profile-picture", auth, deleteProfilePicture); // Route corrigée
router.put("/change-password", auth, changePassword);

module.exports = router;