const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { logEvent } = require("../../utils/logEvent");
const { notifyUser } = require("../../utils/notifyUser");
const { isBlocked, registerFailure, resetAttempts } = require("./loginThrottle");

const createToken = (user, deviceId) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      deviceId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.validatedBody;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await logEvent({
      action: "user_registered",
      user: user.email,
      userId: user._id,
      status: "success",
      details: `Registered as ${role}`,
      ipAddress: req.ip || "unknown",
    });

    return res.status(201).json({
      message: "Registration successful",
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

const login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;
    const ipAddress = req.ip || "unknown";
    const deviceId = String(req.headers["x-civicshield-device-id"] || "").trim();

    if (!deviceId) {
      return res.status(400).json({ message: "Zero-trust device context is required." });
    }

    if (isBlocked(email, ipAddress)) {
      const blockedUser = await User.findOne({ email });

      await logEvent({
        action: "login_attempt",
        user: email,
        userId: blockedUser?._id || null,
        status: "blocked",
        details: "Too many attempts. Try again later.",
        ipAddress,
      });

      if (blockedUser) {
        await notifyUser({
          userId: blockedUser._id,
          userEmail: blockedUser.email,
          type: "repeated_login_attempts",
          title: "Repeated Login Attempts Detected",
          message: "Your account was temporarily blocked after repeated failed login attempts.",
          severity: "warning",
        });
      }

      return res.status(429).json({ message: "Too many attempts. Try again later." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      const blocked = registerFailure(email, ipAddress);

      await logEvent({
        action: "login_attempt",
        user: email,
        status: blocked ? "blocked" : "failed",
        details: blocked ? "Too many attempts. Try again later." : "Unknown email address",
        ipAddress,
      });

      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const blocked = registerFailure(email, ipAddress);

      await logEvent({
        action: "login_attempt",
        user: user.email,
        userId: user._id,
        status: blocked ? "blocked" : "failed",
        details: blocked ? "Too many attempts. Try again later." : "Incorrect password",
        ipAddress,
      });

      if (blocked) {
        await notifyUser({
          userId: user._id,
          userEmail: user.email,
          type: "repeated_login_attempts",
          title: "Repeated Login Attempts Detected",
          message: "Your account was temporarily blocked after repeated failed login attempts.",
          severity: "warning",
        });
      }

      return res.status(401).json({ message: "Invalid credentials." });
    }

    resetAttempts(email, ipAddress);

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
      token: createToken(user, deviceId),
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
  register,
  login,
};
