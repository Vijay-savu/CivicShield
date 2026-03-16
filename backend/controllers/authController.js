const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { logEvent } = require("../utils/logEvent");

const createToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;
    const user = await User.findOne({ email });
    const ipAddress = req.ip || "unknown";

    if (!user) {
      await logEvent({
        action: "login_attempt",
        user: email,
        status: "failed",
        details: "Unknown email address",
        ipAddress,
      });

      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await logEvent({
        action: "login_attempt",
        user: user.email,
        userId: user._id,
        status: "failed",
        details: "Incorrect password",
        ipAddress,
      });

      return res.status(401).json({ message: "Invalid credentials." });
    }

    await logEvent({
      action: "login_attempt",
      user: user.email,
      userId: user._id,
      status: "success",
      details: `Authenticated as ${user.role}`,
      ipAddress,
    });

    return res.status(200).json({
      message: "Login successful",
      token: createToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  login,
};
