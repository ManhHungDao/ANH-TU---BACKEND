import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Prescription from "../models/prescription";
import _ from "lodash";
import Schedule from "../models/schedule";

exports.upsert = catchAsyncErrors(async (req, res, next) => {
  const { scheduleId, detail, result } = req.body;
  if (!scheduleId) {
    return next(new ErrorHandler("Required scheduleId", 400));
  }
  if (!detail) {
    return next(new ErrorHandler("Required detail", 400));
  }
  if (!result) {
    return next(new ErrorHandler("Required result", 400));
  }
  // let prescription;
  // const check = await Prescription.findOne({ scheduleId: scheduleId });
  // if (!check)
  //   prescription = await Prescription.create({
  //     scheduleId,
  //     detail,
  //     result,
  //   });
  // else {
  //   let options = {
  //     upsert: true,
  //     new: true,
  //     runValidators: true,
  //     useFindAndModify: false,
  //   };
  //   prescription = await Prescription.findOneAndUpdate(
  //     { scheduleId: scheduleId },
  //     req.body,
  //     options
  //   );
  // }
  let options = {
    upsert: true,
    new: true,
    runValidators: true,
    useFindAndModify: false,
  };
  let prescription = await Prescription.findOneAndUpdate(
    { scheduleId: scheduleId },
    req.body,
    options
  );
  res.status(200).json({
    prescription,
    success: true,
  });
});

exports.getSingle = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;

  if (!id) {
    return next(new ErrorHandler("Required scheduleId", 400));
  }

  const prescription = await Prescription.findOne({
    scheduleId: id,
  });

  if (!prescription)
    return res.status(200).json({
      success: false,
    });

  res.status(200).json({
    prescription,
    success: true,
  });
});

// lấy ra những kết quả khám gần đây của bệnh nhân
exports.getListResultRecent = catchAsyncErrors(async (req, res, next) => {
  const email = req.query.email;

  if (!email) {
    return next(new ErrorHandler("Required email patient", 400));
  }

  let listId = await Schedule.aggregate([
    {
      $unwind: "$schedule",
    },
    {
      $match: {
        "schedule.status": "Hoàn thành",
        "schedule.user.email": email,
      },
    },
    {
      $project: {
        "schedule._id": 1,
      },
    },
  ]);
  listId = listId.map((e) => e.schedule._id);

  const listResult = await Prescription.find({
    scheduleId: { $in: listId },
  })
    .sort({ updatedAt: -1 })
    .skip(0)
    .limit(5);

  res.status(200).json({
    listResult,
    success: true,
  });
});
