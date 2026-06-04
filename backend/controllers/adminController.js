const User = require("../models/User");
const Book = require("../models/Book");
const Borrowed = require("../models/Borrowed");
const ContactMessage = require("../models/ContactMessage");

const getDashboardSummary = async (req, res) => {
  try {
    const [users, books, borrowed, borrowedActive, reserved, contacts] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      Borrowed.countDocuments(),
      Borrowed.countDocuments({ status: "borrowed" }),
      Borrowed.countDocuments({ status: "reserved" }),
      ContactMessage.countDocuments(),
    ]);

    return res.json({
      success: true,
      data: {
        users,
        books,
        borrowed,
        borrowedActive,
        reserved,
        contacts,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.json({ success: true, total: users.length, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "role must be student or admin" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "User role updated successfully", data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    return res.json({ success: true, total: books.length, data: books });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getLibraryStats = async (req, res) => {
  try {
    const booksByFaculty = await Book.aggregate([
      { $group: { _id: "$faculty", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const booksByStatus = await Book.aggregate([
      { $group: { _id: "$isActive", total: { $sum: 1 } } },
    ]);

    return res.json({
      success: true,
      data: {
        booksByFaculty,
        booksByStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardSummary,
  getUsers,
  updateUserRole,
  toggleUserStatus,
  getBooks,
  getLibraryStats,
};