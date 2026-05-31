const express = require("express");
const router = express.Router();

const protect =
require("../middleware/authMiddleware");

const {
  borrowBook,
  getBorrowed,
  returnBook,
  reserveBook
} = require("../controllers/borrowedController");


// BORROW
router.post(
"/",
protect,
borrowBook
);


// GET MY BOOKS
router.get(
"/",
protect,
getBorrowed
);


// RETURN BOOK
router.put(
"/:id",
protect,
returnBook
);


// RESERVE BOOK
router.post(
"/reserve",
protect,
reserveBook
);

module.exports = router;