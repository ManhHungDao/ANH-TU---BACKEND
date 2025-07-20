// models/Menu.js
const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  title: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", default: null }, // null nếu là cấp 1
  order: { type: Number, default: 0 }, // sắp xếp menu
});

module.exports = mongoose.model("Menu", menuSchema);
