const express = require("express");
const router = express.Router();
const { register, login, updateProfile, changePassword, upload } = require("../controllers/auth.controller");
const { auth } = require("../middlewares/auth");

// Utilisez le middleware d'upload pour la route register
router.post("/register", upload.single('profilePicture'), register);
router.post("/login", login);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);

module.exports = router;