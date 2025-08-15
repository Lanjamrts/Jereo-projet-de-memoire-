const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const Autorite = require("../models/Autorite");
const User = require("../models/User");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Autorités de base
    const base = ["Police", "Pompier", "Ambulance"];
    const inserted = [];
    for (const nom of base) {
      const found = await Autorite.findOne({ nom });
      if (!found) {
        const a = await Autorite.create({ nom });
        inserted.push(a);
      } else {
        inserted.push(found);
      }
    }

    // Admin par défaut
    const adminEmail = "admin@jereo.local";
    const exists = await User.findOne({ email: adminEmail });
    if (!exists) {
      const hash = await bcrypt.hash("admin123", 10);
      await User.create({
        firstName: "Admin",
        lastName: "Jereo",
        birthDate: new Date("1990-01-01"),
        email: adminEmail,
        password: hash,
        role: "admin",
      });
    }

    console.log("Seed terminé ✅");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
