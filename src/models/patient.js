const mongoose = require("mongoose");
const Schema = mongoose.Schema;
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const patientSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    default: "M",
  },
  phone: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
  insurance: {
    type: String,
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
});

//ecrypting password before save
patientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//compare password against
patientSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Return JWT token
patientSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

//reste password
patientSchema.methods.getResetPassword = function () {
  //Generate token
  const restToken = crypto.randomBytes(20).toString("hex");

  //Hash and set to resetpassword
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(restToken)
    .digest("hex");

  //set token expire time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return restToken;
};

module.exports = mongoose.model("Patient", patientSchema);
