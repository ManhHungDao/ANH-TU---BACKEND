// currentNummber: DataTypes.INTEGER,
// maxNumber: DataTypes.INTEGER,
// date: DataTypes.STRING,
// timeType: DataTypes.STRING,
// doctorId: DataTypes.INTEGER,
const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const scheduleSchema = new Schema({
  doctor: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
    },
  },
  packet: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Packet",
    },
    name: {
      type: String,
    },
  },
  detail: {
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
    note: {
      type: String,
    },
  },
  schedule: [
    {
      time: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Allcode",
        required: true,
      },
      user: {
        email: {
          type: String,
          default: null,
        },
        name: {
          type: String,
          default: null,
        },
        phone: {
          type: String,
          default: null,
        },
        address: {
          type: String,
          default: null,
        },
        gender: {
          type: String,
          default: null,
        },
        dayOfBirth: {
          type: String,
          default: null,
        },
        insurance: {
          type: String,
        },
        reason: {
          type: String,
          default: null,
        },
      },
      status: {
        type: String,
        default: "Lịch hẹn mới",
      },
      rating: {
        type: Number,
        default: null,
      },
      comment: {
        type: String,
        default: null,
      },
    },
  ],
  date: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Schedule", scheduleSchema);
