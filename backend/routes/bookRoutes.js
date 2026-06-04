const express = require("express");
const router = express.Router();

const {
  addBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  toggleBookStatus,
} = require("../controllers/bookController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

router.get("/", getBooks);
router.get("/search", getBooks);
router.get("/:id", getBookById);
router.post("/", protect, adminOnly, addBook);
router.put("/:id", protect, adminOnly, updateBook);
router.delete("/:id", protect, adminOnly, deleteBook);
router.patch("/:id/toggle-status", protect, adminOnly, toggleBookStatus);

module.exports = router;