const express = require("express");
const { register, login } = require("./authController");
const { validateLogin, validateRegister } = require("../../middleware/validationMiddleware");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    service: "Auth Service",
    status: "active",
    capability: "login, registration, JWT, zero-trust session binding",
  });
});

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

module.exports = router;
