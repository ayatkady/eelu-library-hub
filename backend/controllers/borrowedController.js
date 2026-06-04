const mongoose = require("mongoose");
const Borrowed = require("../models/Borrowed");
const Book = require("../models/Book");
const { isValidObjectId } = require("../middleware/validators");

const DEFAULT_BORROW_DAYS = 14;

const makeDueDate = () => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + DEFAULT_BORROW_DAYS);
  return dueDate;
};

const borrowBook = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    if (!isValidObjectId(bookId)) {
      return res.status(400).json({ success: false, message: "Valid bookId is required" });
    }

    await session.withTransaction(async () => {
      const book = await Book.findById(bookId).session(session);

      if (!book || !book.isActive) {
        throw new Error("Book not found");
      }

      if (book.availableCopies <= 0) {
        throw new Error("No available copies");
      }

      const existingOpenRecord = await Borrowed.findOne({
        userId,
        bookId,
        status: { $in: ["borrowed", "reserved"] },
      }).session(session);

      if (existingOpenRecord) {
        throw new Error("You already have an active record for this book");
      }

      book.availableCopies -= 1;
      await book.save({ session });

      const [record] = await Borrowed.create(
        [
          {
            userId,
            bookId,
            status: "borrowed",
            borrowDate: new Date(),
            dueDate: makeDueDate(),
          },
        ],
        { session }
      );

      return res.status(201).json({
        success: true,
        message: "Book borrowed successfully",
        data: record,
      });
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

const reserveBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user._id;

    if (!isValidObjectId(bookId)) {
      return res.status(400).json({ success: false, message: "Valid bookId is required" });
    }

    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    const existingOpenRecord = await Borrowed.findOne({
      userId,
      bookId,
      status: { $in: ["borrowed", "reserved"] },
    });

    if (existingOpenRecord) {
      return res.status(409).json({
        success: false,
        message: "You already have an active record for this book",
      });
    }

    const record = await Borrowed.create({
      userId,
      bookId,
      status: "reserved",
      borrowDate: new Date(),
      dueDate: makeDueDate(),
    });

    return res.status(201).json({
      success: true,
      message: "Book reserved successfully",
      data: record,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBorrowed = async (req, res) => {
  try {
    const data = await Borrowed.find({ userId: req.user._id })
      .populate("bookId")
      .sort({ createdAt: -1 });

    const now = new Date();
    const enrichedData = data.map((item) => {
      const borrowedDays = Math.max(0, Math.floor((now - new Date(item.borrowDate)) / (1000 * 60 * 60 * 24)));
      return {
        ...item._doc,
        borrowedDays,
        isOverdue: Boolean(item.dueDate && item.status === "borrowed" && new Date(item.dueDate) < now),
      };
    });

    return res.json({ success: true, totalBorrowed: data.length, data: enrichedData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBorrowById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid borrow id" });
    }

    const record = await Borrowed.findById(req.params.id).populate("bookId").populate("userId", "fullName email faculty academicYear role");
    if (!record) {
      return res.status(404).json({ success: false, message: "Borrow record not found" });
    }

    if (req.user.role !== "admin" && String(record.userId._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You are not allowed to view this record" });
    }

    return res.json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const returnBook = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      if (!isValidObjectId(req.params.id)) {
        throw new Error("Invalid borrow id");
      }

      const record = await Borrowed.findById(req.params.id).session(session);
      if (!record) {
        throw new Error("Borrow record not found");
      }

      if (req.user.role !== "admin" && String(record.userId) !== String(req.user._id)) {
        throw new Error("You are not allowed to update this record");
      }

      if (record.status === "returned") {
        throw new Error("Book already returned");
      }

      const previousStatus = record.status;
      record.status = "returned";
      record.returnDate = new Date();

      if (previousStatus === "borrowed") {
        const book = await Book.findById(record.bookId).session(session);
        if (book) {
          book.availableCopies += 1;
          await book.save({ session });
        }
      }

      await record.save({ session });

      return res.json({ success: true, message: "Book returned successfully", data: record });
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

const cancelReservation = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid reservation id" });
    }

    const record = await Borrowed.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: "reserved",
    });

    if (!record) {
      return res.status(404).json({ success: false, message: "Reservation not found" });
    }

    record.status = "cancelled";
    await record.save();

    return res.json({ success: true, message: "Reservation cancelled successfully", data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllBorrowed = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const data = await Borrowed.find(filter)
      .populate("userId", "fullName email faculty academicYear role")
      .populate("bookId")
      .sort({ createdAt: -1 });

    return res.json({ success: true, total: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBorrowedStats = async (req, res) => {
  try {
    const [borrowedCount, reservedCount, returnedCount, cancelledCount, overdueCount] = await Promise.all([
      Borrowed.countDocuments({ status: "borrowed" }),
      Borrowed.countDocuments({ status: "reserved" }),
      Borrowed.countDocuments({ status: "returned" }),
      Borrowed.countDocuments({ status: "cancelled" }),
      Borrowed.countDocuments({ status: "borrowed", dueDate: { $lt: new Date() } }),
    ]);

    return res.json({
      success: true,
      data: {
        borrowedCount,
        reservedCount,
        returnedCount,
        cancelledCount,
        overdueCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  borrowBook,
  reserveBook,
  getBorrowed,
  getBorrowById,
  returnBook,
  cancelReservation,
  getAllBorrowed,
  getBorrowedStats,
};