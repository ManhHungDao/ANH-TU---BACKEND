// models/Step.js
const mongoose = require("mongoose");

const StepSchema = new mongoose.Schema(
  {
    infoBoard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InfoBoard",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Step", StepSchema);
