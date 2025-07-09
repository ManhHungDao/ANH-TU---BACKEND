const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  content: {
    type: String, // Lưu HTML
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("File", FileSchema);
