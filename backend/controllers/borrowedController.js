const Borrowed = require("../models/Borrowed");

// ================= BORROW BOOK =================
const borrowBook = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "bookId is required"
      });
    }

    const record = await Borrowed.create({
      userId,
      bookId,
      status: "borrowed",
      borrowDate: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Book borrowed successfully",
      data: record
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getBorrowed = async (req, res) => {
  try {
    const userId = req.user._id;

const data = await Borrowed
.find({ userId })
.populate("bookId");
    const now = new Date();

    const enrichedData = data.map((item) => {
      const diffTime = now - new Date(item.borrowDate);
      const borrowedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...item._doc,
        borrowedDays
      };
    });

    res.json({
      success: true,
      totalBorrowed: data.length,
      data: enrichedData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const returnBook = async (req, res) => {
  try {
    const updated = await Borrowed.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      {
        status: "returned",
        returnDate: new Date()
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Borrow record not found"
      });
    }

    res.json({
      success: true,
      message: "Book returned successfully",
      data: updated
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const reserveBook = async (req, res) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "bookId is required"
      });
    }

    const record = await Borrowed.create({
      userId,
      bookId,
      status: "reserved",
      borrowDate: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Book reserved successfully",
      data: record
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= EXPORT =================
module.exports = {
  borrowBook,
  getBorrowed,
  returnBook,
  reserveBook
};