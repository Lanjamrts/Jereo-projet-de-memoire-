const express = require("express");
const router = express.Router();
const { register, login, updateProfile, changePassword } = require("../controllers/auth.controller");
const { auth } = require("../middlewares/auth");

router.post("/register", register);
router.post("/login", login);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);

module.exports = router;