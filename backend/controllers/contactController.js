const ContactMessage = require("../models/ContactMessage");
const { validateContact } = require("../middleware/validators");

const createContactMessage = async (req, res) => {
  try {
    const payload = validateContact(req.body);

    if (!payload.ok) {
      return res.status(400).json({ success: false, message: payload.errors[0], errors: payload.errors });
    }

    const message = await ContactMessage.create({
      ...payload.data,
      submittedBy: req.user?._id,
    });

    return res.status(201).json({ success: true, message: "Message sent successfully", data: message });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().populate("submittedBy", "fullName email role").sort({ createdAt: -1 });

    return res.json({ success: true, total: messages.length, data: messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["new", "read", "resolved"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updated = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    return res.json({ success: true, message: "Message status updated successfully", data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteContactMessage = async (req, res) => {
  try {
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    return res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createContactMessage,
  getContactMessages,
  updateContactStatus,
  deleteContactMessage,
};