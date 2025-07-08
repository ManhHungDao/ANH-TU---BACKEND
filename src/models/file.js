const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const fileSchema = new Schema({
  fileName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type",
    },
    type: {
      type: String,
    },
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("File", fileSchema);
