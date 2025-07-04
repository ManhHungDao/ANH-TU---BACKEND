const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const roleSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  permissions: { type: [String], required: true },
});

module.exports = mongoose.model("Role", roleSchema);
