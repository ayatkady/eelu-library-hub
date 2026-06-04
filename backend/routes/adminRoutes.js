const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  getDashboardSummary,
  getUsers,
  updateUserRole,
  toggleUserStatus,
  getBooks,
  getLibraryStats,
} = require("../controllers/adminController");
const {
  getContactMessages,
  updateContactStatus,
  deleteContactMessage,
} = require("../controllers/contactController");

router.use(protect, adminOnly);

router.get("/dashboard", getDashboardSummary);
router.get("/users", getUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", toggleUserStatus);
router.get("/books", getBooks);
router.get("/library-stats", getLibraryStats);
router.get("/messages", getContactMessages);
router.put("/messages/:id/status", updateContactStatus);
router.delete("/messages/:id", deleteContactMessage);

module.exports = router;