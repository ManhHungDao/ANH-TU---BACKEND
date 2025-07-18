// models/InfoBoard.js
const mongoose = require("mongoose");

const InfoBoardSchema = new mongoose.Schema(
  {
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
      unique: true,
    },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InfoBoard", InfoBoardSchema);
