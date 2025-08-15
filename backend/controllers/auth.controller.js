const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, birthDate, email, password, role, autoriteId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Utilisateur déjà existant" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      birthDate,
      email,
      password: hashedPassword,
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
        role: user.role,
        autorite: user.autoriteId ? { id: user.autoriteId._id, nom: user.autoriteId.nom } : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
