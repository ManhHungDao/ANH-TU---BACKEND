const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const typeSchema = new Schema({
  type: {
    type: String,
  },
});

module.exports = mongoose.model("Type", typeSchema);
