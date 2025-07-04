import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import _ from "lodash";
import Role from "../models/role";

exports.upsert = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    return next(new ErrorHandler("Required id", 400));
  }

  let upsertRole = await Role.findOneAndUpdate({ userId: userId }, req.body, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  res.status(200).json({
    success: true,
    upsertRole,
  });
});

exports.getRoleUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;

  if (!id) {
    return next(new ErrorHandler("Required id", 400));
  }

  let permissions = await Role.findOne({ userId: id }, "permissions");

  if (!permissions) permissions = [];
  else {
    permissions = permissions.permissions;
  }

  res.status(200).json({
    permissions: permissions,
    success: true,
  });
});

// route role thuộc phân quyền người dùng -> route user
