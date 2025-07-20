const mongoose = require("mongoose");
const attachmentSchema = new mongoose.Schema({
  filename: String,
  mimetype: String,
  size: Number,
  data: Buffer, // lưu file binary
});

const stepSchema = new mongoose.Schema({
  menu: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
  title: { type: String, required: true },
  content: { type: String, default: "" },
  order: { type: Number, default: 0 },
  attachments: [attachmentSchema], // danh sách file đính kèm dạng buffer
});

const Step = mongoose.model("Step", stepSchema);
