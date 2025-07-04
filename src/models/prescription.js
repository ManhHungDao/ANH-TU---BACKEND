const mongoose = require("mongoose");
const Schema = mongoose.Schema;
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const priscriptionSchema = new Schema(
  {
    scheduleId: {
      type: String,
      required: true,
    },
    doctor: {
      type: String,
    },
    packet: {
      type: String,
    },
    clinic: {
      type: String,
    },
    specialty: {
      type: String,
    },
    detail: {
      type: String,
      required: true,
    },
    result: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("priscription", priscriptionSchema);
