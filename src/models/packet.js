const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const packetSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  clinic: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  type: {
    typeCode: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Allcode",
      },
      name: {
        type: String,
      },
    },
    specialty: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Allcode",
      },
      name: {
        type: String,
      },
    },
  },
  price: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Allcode",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  payment: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Allcode",
      required: true,
    },
    name: {
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
  introduce: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Packet", packetSchema);
