const bcrypt = require("bcrypt");
const User = require("../models/User");

const demoUsers = [
  {
    name: "Vijay",
    email: process.env.DEMO_CITIZEN_EMAIL || "citizen@civicshield.local",
    password: process.env.DEMO_CITIZEN_PASSWORD || "Citizen@123",
    role: "citizen",
  },
  {
    name: "Rohan Officer",
    email: process.env.DEMO_OFFICER_EMAIL || "officer@civicshield.local",
    password: process.env.DEMO_OFFICER_PASSWORD || "Officer@123",
    role: "officer",
  },
  {
    name: "Meera Security Admin",
    email: process.env.DEMO_ADMIN_EMAIL || "admin@civicshield.local",
    password: process.env.DEMO_ADMIN_PASSWORD || "Admin@123",
    role: "admin",
  },
];

const ensureDemoUsers = async () => {
  for (const user of demoUsers) {
    const existingUser = await User.findOne({ email: user.email.toLowerCase() });

    if (existingUser) {
      if (existingUser.name !== user.name) {
        existingUser.name = user.name;
        await existingUser.save();
      }
      continue;
    }

    const password = await bcrypt.hash(user.password, 10);

    await User.create({
      name: user.name,
      email: user.email.toLowerCase(),
      password,
      role: user.role,
    });
  }
};

module.exports = {
  ensureDemoUsers,
};
