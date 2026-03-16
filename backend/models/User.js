const mongoose = require("mongoose");

// Users can be citizens, government officers, or security admins.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["citizen", "officer", "admin"],
      required: true,
    },
    verifiedIncome: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
