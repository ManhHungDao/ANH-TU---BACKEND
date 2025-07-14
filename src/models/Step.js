// models/Step.js
const mongoose = require("mongoose");

const StepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" }, // HTML từ CKEditor
  attachments: [
    {
      name: String, // Tên file
      url: String, // Đường dẫn tải file
      size: Number, // Dung lượng file
      type: String, // MIME type
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Step", StepSchema);
