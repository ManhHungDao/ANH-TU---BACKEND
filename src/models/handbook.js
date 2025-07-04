const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const handbookSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
    required: true,
  },
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  clinic: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
    },
    name: {
      type: String,
    },
  },
  specialty: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Specialty",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
});

module.exports = mongoose.model("Handbook", handbookSchema);
