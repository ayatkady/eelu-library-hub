const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  createContactMessage,
  getContactMessages,
  updateContactStatus,
  deleteContactMessage,
} = require("../controllers/contactController");

router.post("/", protect, createContactMessage);
router.get("/", protect, adminOnly, getContactMessages);
router.put("/:id/status", protect, adminOnly, updateContactStatus);
router.delete("/:id", protect, adminOnly, deleteContactMessage);

module.exports = router;