const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { validateRegister, validateLogin } = require("../middleware/validators");

const register = async (req, res) => {
  try {
    const payload = validateRegister(req.body);

    if (!payload.ok) {
      return res.status(400).json({
        success: false,
        message: payload.errors[0],
        errors: payload.errors,
      });
    }

    const { fullName, email, password, faculty, academicYear } = payload.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const newUser = new User({
      fullName,
      email,
      password,
      faculty,
      academicYear,
      role: "student",
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const payload = validateLogin(req.body);

    if (!payload.ok) {
      return res.status(400).json({
        success: false,
        message: payload.errors[0],
        errors: payload.errors,
      });
    }

    const { email, password } = payload.data;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        faculty: user.faculty,
        academicYear: user.academicYear,
        role: user.role,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (req.body.fullName !== undefined) user.fullName = String(req.body.fullName).trim();
    if (req.body.faculty !== undefined) user.faculty = req.body.faculty;
    if (req.body.academicYear !== undefined) user.academicYear = req.body.academicYear;

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "currentPassword and newPassword are required",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};