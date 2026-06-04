const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  borrowBook,
  getBorrowed,
  getBorrowById,
  returnBook,
  reserveBook,
  cancelReservation,
  getAllBorrowed,
  getBorrowedStats,
} = require("../controllers/borrowedController");

router.post("/", protect, borrowBook);
router.post("/borrow", protect, borrowBook);
router.post("/reserve", protect, reserveBook);
router.get("/", protect, getBorrowed);
router.get("/my", protect, getBorrowed);
router.get("/admin/all", protect, adminOnly, getAllBorrowed);
router.get("/admin/stats", protect, adminOnly, getBorrowedStats);
router.get("/:id", protect, getBorrowById);
router.put("/:id", protect, returnBook);
router.put("/:id/return", protect, returnBook);
router.put("/:id/cancel", protect, cancelReservation);
router.put("/:id/cancel-reservation", protect, cancelReservation);

module.exports = router;