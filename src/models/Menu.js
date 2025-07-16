// models/Menu.js
const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    files: [
      {
        name: String,
        url: String,
        size: Number,
        type: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const level3Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    steps: [stepSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const level2Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    children: [level3Schema],
    steps: [stepSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    children: [level2Schema],
    steps: [stepSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for better performance
menuSchema.index({ name: "text" });
level2Schema.index({ name: "text" });
level3Schema.index({ name: "text" });

module.exports = mongoose.model("Menu", menuSchema);
