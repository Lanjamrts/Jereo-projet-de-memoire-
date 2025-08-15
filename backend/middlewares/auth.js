const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
    if (!token) return res.status(401).json({ message: "Non autorisé" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, autoriteId }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Non autorisé" });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Accès refusé" });
  next();
};
