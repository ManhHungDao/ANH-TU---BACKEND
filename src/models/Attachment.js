// models/Attachment.js
const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema(
  {
    step: { type: mongoose.Schema.Types.ObjectId, ref: "Step", required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String },
    size: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attachment", AttachmentSchema);
