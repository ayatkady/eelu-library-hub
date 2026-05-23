const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

// ================= REGISTER =================
router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "Welcome 🎉",
    user: req.user,
  });
});


router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, faculty, academicYear } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
return res.status(409).json({
  success: false,
  message: "User already exists"
});  
  }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      faculty,
      academicYear,
    });

    await newUser.save();

    res.json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const userData = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      faculty: user.faculty,
      academicYear: user.academicYear
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;