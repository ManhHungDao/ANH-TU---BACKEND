const mongoose = require("mongoose");
const Schema = mongoose.Schema;
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
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
  password: {
    type: String,
    required: true,
    default: "123456Aa.",
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
  roleId: { type: String, required: true, default: "R3" },

  dateOfBirth: {
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
  },
  detail: {
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
    specialty: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Specialty",
        // required: true,
      },
      name: {
        type: String,
        // required: true,
      },
    },
    position: {
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
    introduce: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: null,
      // required: true,
    },
    detail: {
      type: String,
      required: true,
    },
  },
});

//ecrypting password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//compare password against
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Return JWT token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });
};

//reste password
userSchema.methods.getResetPassword = function () {
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

module.exports = mongoose.model("User", userSchema);
