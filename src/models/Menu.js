// models/Menu.js
const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    level: { type: Number, enum: [1, 2, 3], required: true },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Menu", MenuSchema);
