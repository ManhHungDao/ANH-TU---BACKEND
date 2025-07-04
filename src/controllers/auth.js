import User from "../models/user";
import Assistant from "../models/assistant";
import Patient from "../models/patient";
import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import sendToken from "../utils/jwtToken";

// exports.login = catchAsyncErrors(async (req, res, next) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return next(new ErrorHandler("Please enter email or Password", 400));
//   }
//   const user = await User.findOne(
//     {
//       email,
//     },
//     "email name roleId password"
//   );
//   if (!user) {
//     return next(new ErrorHandler("Invalid email or Password", 400));
//   }
//   const isPasswordMatched = await user.comparePassword(password);
//   if (!isPasswordMatched) {
//     return next(new ErrorHandler("Invalid Password", 400));
//   }
//   sendToken(user, 200, res);
// });

exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email or Password", 400));
  }
  const user = await User.findOne(
    {
      email,
    },
    "email name roleId password"
  );
  if (user) {
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      console.log("Invalid Password");
      return next(new ErrorHandler("Invalid Password", 400));
    }
    sendToken(user, 200, res);
  }

  const assistant = await Assistant.findOne(
    {
      email,
    },
    "email name roleId password doctor"
  );
  if (assistant) {
    const isPasswordMatchedAssistant = await assistant.comparePassword(
      password
    );
    if (!isPasswordMatchedAssistant) {
      return next(new ErrorHandler("Invalid Password", 400));
    }
    sendToken(assistant, 200, res);
  }

  if (!user && !assistant) {
    return next(new ErrorHandler("Invalid email or Password", 400));
  }
});

exports.changePassword = catchAsyncErrors(async (req, res, next) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!oldPassword) {
    return next(new ErrorHandler("Requied old password", 400));
  }
  if (!newPassword) {
    return next(new ErrorHandler("Requied new password", 400));
  }
  const user = await User.findOne(
    {
      email,
    },
    "email name roleId password"
  );
  if (!user) {
    return next(new ErrorHandler("Không thể xác định tài khoản", 400));
  }
  const isPasswordMatched = await user.comparePassword(oldPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Mật khẩu cũ chưa chính xác", 400));
  }
  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res);
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne(
    {
      email,
    },
    "email name roleId password"
  );
  if (!user) {
    return next(new ErrorHandler("Không thể xác định tài khoản", 400));
  }
  user.password = "123456Aa.";
  await user.save();
  sendToken(user, 200, res);
});

// logic patient
exports.patientLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email or Password", 400));
  }
  const patient = await Patient.findOne(
    {
      email,
    },
    "email name roleId password"
  );
  if (!patient) {
    return next(new ErrorHandler("Invalid email or Password", 400));
  }
  const isPasswordMatched = await patient.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Password", 400));
  }
  sendToken(patient, 200, res);
});

exports.patientChangePassword = catchAsyncErrors(async (req, res, next) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!oldPassword) {
    return next(new ErrorHandler("Requied old password", 400));
  }
  if (!newPassword) {
    return next(new ErrorHandler("Requied new password", 400));
  }
  const patient = await Patient.findOne(
    {
      email,
    },
    "email name roleId password"
  );
  if (!patient) {
    return next(new ErrorHandler("Không thể xác định tài khoản", 400));
  }
  const isPasswordMatched = await patient.comparePassword(oldPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Mật khẩu cũ chưa chính xác", 400));
  }
  patient.password = newPassword;
  await patient.save();
  sendToken(patient, 200, res);
});

exports.patientResetPassword = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  const patient = await Patient.findOne(
    {
      email,
    },
    "email name roleId password"
  );
  if (!patient) {
    return next(new ErrorHandler("Không thể xác định tài khoản", 400));
  }
  patient.password = password;
  await patient.save();
  sendToken(patient, 200, res);
});

// assistant
exports.assistantResetPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const assistant = await Assistant.findOne(
    {
      email,
    },
    "email name password"
  );
  if (!assistant) {
    return next(new ErrorHandler("Không thể xác định tài khoản", 400));
  }
  assistant.password = "123456Aa.";
  await assistant.save();
  sendToken(assistant, 200, res);
});

exports.assistantChangePassword = catchAsyncErrors(async (req, res, next) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!oldPassword) {
    return next(new ErrorHandler("Requied old password", 400));
  }
  if (!newPassword) {
    return next(new ErrorHandler("Requied new password", 400));
  }
  const assistant = await Assistant.findOne(
    {
      email,
    },
    "email name roleId password"
  );
  if (!assistant) {
    return next(new ErrorHandler("Không thể xác định tài khoản", 400));
  }
  const isPasswordMatched = await assistant.comparePassword(oldPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Mật khẩu cũ chưa chính xác", 400));
  }
  assistant.password = newPassword;
  await assistant.save();
  sendToken(assistant, 200, res);
});
