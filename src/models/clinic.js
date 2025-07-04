const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const clinicSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    province: {
      type: String,
      required: true,
    },
    detail: {
      type: String,
      required: true,
    },
    lat: {
      type: String,
      required: true,
    },
    lng: {
      type: String,
      required: true,
    },
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
  logo: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  introduce: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Clinic", clinicSchema);
