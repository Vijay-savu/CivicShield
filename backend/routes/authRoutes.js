const express = require("express");
const rateLimit = require("express-rate-limit");
const { login } = require("../controllers/authController");
const { validateLogin } = require("../middleware/validationMiddleware");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});

router.post("/login", loginLimiter, validateLogin, login);

module.exports = router;
