const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type", // Liên kết với Model Type
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);
