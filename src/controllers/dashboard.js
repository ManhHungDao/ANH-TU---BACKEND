import Clinic from "../models/clinic";
import Specialty from "../models/specialty";
import User from "../models/user";
import Handbook from "../models/handbook";
import Patient from "../models/patient";
import Schedule from "../models/schedule";
import Allcode from "../models/allcode";
import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";

// exports.getAllCount = catchAsyncErrors(async (req, res, next) => {
//   const clinic = await Clinic.count();
//   const user = await User.count();
//   const specialty = await Specialty.count();
//   const patient = await Patient.count();
//   const [schedule] = await Schedule.aggregate([
//     {
//       $unwind: "$schedule",
//     },
//     { $match: { "schedule.status": "Hoàn thành" } },
//     { $group: { _id: "$schedule.status", count: { $sum: 1 } } },
//   ]);
//   res.status(200).json({
//     count: {
//       clinic,
//       user: user - 1,
//       specialty,
//       patient,
//       schedule: schedule.count,
//     },
//     success: true,
//   });
// });

exports.getAllCount = catchAsyncErrors(async (req, res, next) => {
  const promises = [
    Clinic.count(),
    User.count(),
    Patient.count(),
    Schedule.aggregate([
      {
        $unwind: "$schedule",
      },
      { $match: { "schedule.status": "Hoàn thành" } },
      { $group: { _id: "$schedule.status", count: { $sum: 1 } } },
    ]),
  ];

  const [clinic, user, patient, schedule] = await Promise.all(promises);

  res.status(200).json({
    count: {
      clinic,
      user: user - 1,
      patient,
      schedule: schedule[0].count,
    },
    success: true,
  });
});
// lấy tất cả lịch khám
exports.getAllMedicalHistory = catchAsyncErrors(async (req, res, next) => {
  const list = await Schedule.aggregate([
    {
      $unwind: "$schedule",
    },
    {
      $match: {
        "schedule.user.email": { $ne: null },
        "schedule.status": "Hoàn thành",
      },
    },
    {
      $project: {
        date: 1,
        "doctor.name": 1,
        "packet.name": 1,
        "detail.price.name": 1,
        "detail.payment.name": 1,
        "detail.note": 1,
        schedule: 1,
      },
    },
  ]);
  res.status(200).json({
    list,
    success: true,
  });
});

// lấy tất cả người dùng
exports.getAllPatientAccount = catchAsyncErrors(async (req, res, next) => {
  const patient = await Patient.find(
    {},
    "name email gender dateOfBirth phone address.detail"
  );
  res.status(200).json({
    list: patient,
    success: true,
  });
});

exports.getAllDoctorAccount = catchAsyncErrors(async (req, res, next) => {
  const doctor = await User.find(
    {
      roleId: { $not: { $regex: "R0" } },
    },
    "name email gender dateOfBirth phone address.detail detail.clinic.name detail.specialty.name detail.position.name"
  );
  res.status(200).json({
    list: doctor,
    success: true,
  });
});

exports.getAllLocationClinic = catchAsyncErrors(async (req, res, next) => {
  const list = await Clinic.find({}, "name address.lat address.lng");
  res.status(200).json({
    list,
    success: true,
  });
});

exports.statisticTimeBooking = catchAsyncErrors(async (req, res, next) => {
  let list = await Schedule.aggregate([
    { $match: {} },
    { $unwind: "$schedule" },
    { $match: { "schedule.status": "Hoàn thành" } },
    {
      $project: {
        "schedule.time": 1,
      },
    },
    { $group: { _id: "$schedule.time", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const sumTimeBooking = list.reduce(
    (accumulator, currentValue) => accumulator + currentValue.count,
    0
  );

  let listTime = await Allcode.find({ type: "TIME" }, "valueVI");
  list = list.map((e) => {
    let [item] = listTime.filter((i) => e._id.toString() === i._id.toString());
    return {
      time: item.valueVI,
      count: e.count,
      percent: ((e.count / sumTimeBooking) * 100).toFixed(3) + "%",
    };
  });
  res.status(200).json({
    list,
    success: true,
  });
});
