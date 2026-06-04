const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
			maxlength: 200,
		},
		author: {
			type: String,
			required: [true, "Author is required"],
			trim: true,
			maxlength: 150,
		},
		category: {
			type: String,
			required: [true, "Category is required"],
			trim: true,
			maxlength: 120,
		},
		faculty: {
			type: String,
			enum: ["IT", "BA"],
			required: true,
		},
		academicYear: {
			type: String,
			enum: ["Year 1", "Year 2", "Year 3", "Year 4"],
			required: true,
		},
		description: {
			type: String,
			required: [true, "Description is required"],
			trim: true,
			maxlength: 5000,
		},
		coverImageUrl: {
			type: String,
			default: "",
			trim: true,
		},
		pdfUrl: {
			type: String,
			default: "",
			trim: true,
		},
		totalCopies: {
			type: Number,
			required: [true, "Total copies is required"],
			min: 0,
		},
		availableCopies: {
			type: Number,
			required: true,
			min: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	}
);

bookSchema.index({ title: "text", author: "text", category: "text" });

module.exports = mongoose.model("Book", bookSchema);