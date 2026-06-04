const Book = require("../models/Book");
const { validateBook, isValidObjectId } = require("../middleware/validators");

const buildBookQuery = (query) => {
  const filter = { isActive: true };

  if (query.faculty) filter.faculty = query.faculty;
  if (query.academicYear || query.year) filter.academicYear = query.academicYear || query.year;
  if (query.category) filter.category = new RegExp(query.category, "i");
  if (query.q) {
    filter.$or = [
      { title: new RegExp(query.q, "i") },
      { author: new RegExp(query.q, "i") },
      { category: new RegExp(query.q, "i") },
      { description: new RegExp(query.q, "i") },
    ];
  }

  if (query.includeInactive === "true") {
    delete filter.isActive;
  }

  return filter;
};

const addBook = async (req, res) => {
  try {
    const payload = validateBook(req.body);
    if (!payload.ok) {
      return res.status(400).json({ success: false, message: payload.errors[0], errors: payload.errors });
    }

    const book = await Book.create({
      ...payload.data,
      createdBy: req.user?._id,
    });

    return res.status(201).json({ success: true, message: "Book created successfully", data: book });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBooks = async (req, res) => {
  try {
    const filter = buildBookQuery(req.query);
    const books = await Book.find(filter).sort({ createdAt: -1 });

    return res.json({ success: true, total: books.length, data: books });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBookById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid book id" });
    }

    const book = await Book.findById(req.params.id);
    if (!book || !book.isActive) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    return res.json({ success: true, data: book });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid book id" });
    }

    const payload = validateBook(req.body, true);
    if (!payload.ok) {
      return res.status(400).json({ success: false, message: payload.errors[0], errors: payload.errors });
    }

    const updateData = {};
    ["title", "author", "category", "faculty", "academicYear", "description", "coverImageUrl", "pdfUrl"].forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = payload.data[field];
      }
    });

    if (req.body.totalCopies !== undefined) updateData.totalCopies = payload.data.totalCopies;
    if (req.body.availableCopies !== undefined) updateData.availableCopies = payload.data.availableCopies;

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    return res.json({ success: true, message: "Book updated successfully", data: updatedBook });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid book id" });
    }

    const deleted = await Book.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    return res.json({ success: true, message: "Book archived successfully", data: deleted });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleBookStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid book id" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    book.isActive = !book.isActive;
    await book.save();

    return res.json({
      success: true,
      message: `Book ${book.isActive ? "activated" : "archived"} successfully`,
      data: book,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  toggleBookStatus,
};