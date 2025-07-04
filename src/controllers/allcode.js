import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Allcode from "../models/allcode";
import Specialty from "../models/specialty";
import Schedule from "../models/schedule";
import User from "../models/user";
import _ from "lodash";

exports.getAll = catchAsyncErrors(async (req, res, next) => {
  const allcodes = await Allcode.find();
  res.status(200).json({
    allcodes,
    success: true,
  });
});

exports.getTypePagination = catchAsyncErrors(async (req, res, next) => {
  let { page, size, filter } = req.query;
  if (!page) {
    page = 1;
  }
  size = parseInt(size);
  if (!size) {
    size = 10;
  }
  if (!filter) {
    return next(new ErrorHandler("Required filter", 404));
  }

  let length = 0;
  let allcodes = null;
  allcodes = await Allcode.find({
    type: filter,
  })
    // .sort({ valueVI: 1 })
    .skip(size * page - size)
    .limit(size);
  length = await Allcode.find({
    type: filter,
  }).count();
  res.status(200).json({
    allcodes,
    success: true,
    count: length,
  });
});

exports.update = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Required allcode id", 400));
  }
  let allcode = await Allcode.findById(id);
  let idAllcode = allcode._id;

  if (!allcode) {
    return next(new ErrorHandler("Allcode not Found", 404));
  }
  let { valueVI } = req.body;
  valueVI = valueVI.trimStart().trim();
  const exist = await Allcode.findOne({ valueVI });
  if (exist) return next(new ErrorHandler("Existed code", 409));
  allcode = await Allcode.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  await Specialty.updateMany(
    { key: idAllcode },
    { $set: { name: req.body.valueVI } }
  );

  const type = req.body.type;
  if (type === "SPECIALTY") {
    await User.updateMany(
      { "detail.specialty.id": idAllcode },
      { $set: { "detail.specialty.name": req.body.valueVI } }
    );
  } else if (type === "PAYMENT") {
    await User.updateMany(
      { "detail.payment.id": idAllcode },
      { $set: { "detail.payment.name": req.body.valueVI } }
    ).then((e) => console.log(e));
  } else if (type === "PRICE") {
    await User.updateMany(
      { "detail.price.id": idAllcode },
      { $set: { "detail.price.name": req.body.valueVI } }
    );
  } else if (type === "POSITION") {
    await User.updateMany(
      { "detail.position.id": idAllcode },
      { $set: { "detail.position.name": req.body.valueVI } }
    );
  }

  res.status(200).json({
    allcode,
    success: true,
  });
});

exports.remove = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Required allcode id", 400));
  }
  let allcode = await Allcode.findById(id);
  if (!allcode) {
    return next(new ErrorHandler("Allcode not Found", 404));
  }
  const existSpe = await Specialty.find({ key: id });
  const existTime = await Schedule.find({ "schedule.time": id });
  if (!_.isEmpty(existSpe) || !_.isEmpty(existTime)) {
    return next(new ErrorHandler("Existed feild in other model", 500));
  }
  await Allcode.deleteOne({ _id: id });
  res.status(200).json({
    message: "Allcode deleted successfully",
    success: true,
  });
});

exports.create = catchAsyncErrors(async (req, res, next) => {
  let { type, valueEN, valueVI } = req.body;
  valueVI = valueVI.trimStart().trim();
  if (!type) {
    return next(new ErrorHandler("Required type", 400));
  }
  if (!valueVI) {
    return next(new ErrorHandler("Required value name", 400));
  }

  const exist = await Allcode.findOne({ valueVI });
  if (exist) return next(new ErrorHandler("Existed code", 409));

  const createAllcode = await Allcode.create({
    type,
    valueEN,
    valueVI,
  });
  res.status(200).json({
    createAllcode,
    success: true,
  });
});
