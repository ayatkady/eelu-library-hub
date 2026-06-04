const mongoose = require("mongoose");

const borrowedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["borrowed", "reserved", "returned", "cancelled"],
      default: "borrowed",
    },
    borrowDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    returnDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

borrowedSchema.index({ userId: 1, bookId: 1, status: 1 });

module.exports = mongoose.model("Borrowed", borrowedSchema);