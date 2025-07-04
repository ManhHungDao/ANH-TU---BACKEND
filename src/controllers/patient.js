import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import sendToken from "../utils/jwtToken";
import cloudinary from "cloudinary";
import Packet from "../models/packet";
import Schedule from "../models/schedule";
import moment from "moment";
import Patient from "../models/patient";
import User from "../models/user";
import Prescription from "../models/prescription";
import _ from "lodash";
const { Configuration, OpenAIApi } = require("openai");

exports.checkEmailExisted = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.query;
  if (!email) {
    return next(new ErrorHandler("Requied old email", 400));
  }
  const patient = await Patient.findOne({
    email: email,
  });
  if (patient)
    res.status(200).json({
      existed: true,
    });
  else {
    res.status(200).json({
      existed: false,
    });
  }
});

exports.create = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    email,
    password,
    gender,
    phone,
    dateOfBirth,
    address,
    insurance,
  } = req.body;
  if (!name) {
    return next(new ErrorHandler("Required name", 400));
  }
  if (!email) {
    return next(new ErrorHandler("Required email", 400));
  }
  if (!password) {
    return next(new ErrorHandler("Required password", 400));
  }
  if (!gender) {
    return next(new ErrorHandler("Required gender", 400));
  }
  if (!phone) {
    return next(new ErrorHandler("Required phone", 400));
  }
  if (!dateOfBirth) {
    return next(new ErrorHandler("Required day of birth", 400));
  }
  if (!address) {
    return next(new ErrorHandler("Required address", 400));
  }

  const patient = await Patient.create({
    email,
    name,
    password,
    gender,
    phone,
    dateOfBirth,
    address,
    insurance: insurance ? insurance : null,
  });

  res.status(200).json({
    patient,
    success: true,
  });
});

exports.getSingle = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;

  if (!id) {
    return next(new ErrorHandler("Required id", 400));
  }

  const patient = await Patient.findById(id).select("-password");
  if (!patient) {
    return next(new ErrorHandler("Patient not Found", 404));
  }

  res.status(200).json({
    patient,
    success: true,
  });
});

exports.update = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;

  if (!id) {
    return next(new ErrorHandler("Required id", 400));
  }

  let patient = await Patient.findById(id);
  if (!patient) {
    return next(new ErrorHandler("Patient not Found", 404));
  }

  patient = await Patient.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    patient,
    success: true,
  });
});

exports.getAll = catchAsyncErrors(async (req, res, next) => {
  let { page, size, sort, filter } = req.query;

  page = parseInt(page);
  if (!page) {
    page = 1;
  }
  size = parseInt(size);
  if (!size) {
    size = 10;
  }
  let length = 0;
  let users = null;
  if (filter) {
    users = await Patient.find(
      {
        $or: [
          {
            name: {
              $regex: filter,
              $options: "i",
            },
          },
          {
            email: {
              $regex: filter,
              $options: "i",
            },
          },
        ],
      },
      "-password"
    )
      .skip(size * page - size)
      .limit(size);
    length = await Patient.find(
      {
        name: {
          $regex: filter,
          $options: "i",
        },
      },
      "-password"
    ).count();
  } else {
    users = await Patient.find()
      .select("-password")
      .skip(size * page - size)
      .limit(size);
    length = await Patient.find().count();
  }
  res.status(200).json({
    users,
    count: length,
    success: true,
  });
});

exports.remove = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Required account id", 400));
  }
  let patient = await Patient.findById(id);
  if (!patient) {
    return next(new ErrorHandler("Account not Found", 404));
  }

  await Patient.deleteOne({
    _id: id,
  });
  res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
});

// dùng để sửa dữ liệu ảo đã thêm
exports.updateFakeData = catchAsyncErrors(async (req, res, next) => {
  // User.updateMany({"created": false}, {"$set":{"created": true}});
  let fakeAddress = {
    province: "Quảng Nam",
    detail: "Nguyễn Huệ, Old Town, Minh An, Hội An, Quảng Nam, Việt Nam",
    lat: "15.878428",
    lng: "108.3311789",
  };

  // await Patient.updateMany(
  //   { password: "password" },
  //   {
  //     $set: {
  //       password:
  //         "$2a$10$PAwYcHip0O77COta/DSDu.Bm2I8L6ywbaq8GTLHxhlsjvHd/sj9lG",
  //     },
  //   }
  // );

  await Schedule.updateMany(
    { "schedule.status": "Chờ xác nhận" },

    {
      $set: {
        "schedule.$[elem].status": "Hoàn thành",
        "schedule.$[elem].rating": 5,
        "schedule.$[elem].comment": "Dịch vụ rất tốt, được quan tâm chu đáo",
      },
    },
    { arrayFilters: [{ $and: [{ "elem.status": "Chờ xác nhận" }] }] }
  );

  // let users = await Packet.find({}, "name ");

  res.status(200).json({
    success: true,
  });
});

// thêm đơn thuốc và kết quả cho tất cả lịch đã khám
exports.updatePrescriptions = catchAsyncErrors(async (req, res, next) => {
  const resultExam = `<p style="margin-left:0px;text-align:justify;">Thoái hóa khớp, chấn thương đầu gối</p>`;
  const prescription = `<figure class="table" style="width:98.65%;"><table class="ck-table-resized"><colgroup><col style="width:38.11%;"><col style="width:12.08%;"><col style="width:49.81%;"></colgroup><tbody><tr><td>Tên thuốc</td><td>Số lượng</td><td>Liều dùng</td></tr><tr><td>Paracetamol</td><td>2 vỉ</td><td><p>– Liều khuyến cáo: uống 1viên Paracetamol 500mg/lần mỗi 4-6 giờ. Uống liên tục 5 đến 7 ngày.</p><p>– Liều tối đa: Uống 3000mg paracetamol/1 ngày (tương đương 6 viên ).</p></td></tr><tr><td>Salazopyrin</td><td>1 hộp</td><td>Mỗi ngày uống 3&nbsp;viên, uống 1 viên sau ăn</td></tr><tr><td>Glucosamine Orihiro</td><td>1 hộp</td><td>Mỗi ngày uống 10&nbsp;viên, uống 2 lần sau ăn</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table></figure>`;

  let listId = await Schedule.aggregate([
    { $match: { date: "1683824400" } },
    {
      $unwind: "$schedule",
    },
    { $match: { "schedule.status": "Hoàn thành" } },
    { $project: { "schedule._id": 1, doctor: 1, packet: 1 } },
    {
      $lookup: {
        from: "users",
        localField: "doctor.id",
        foreignField: "_id",
        as: "doctor",
      },
    },
    {
      $lookup: {
        from: "packets",
        localField: "packet.id",
        foreignField: "_id",
        as: "packet",
      },
    },
    { $project: { "schedule._id": 1, doctor: 1, packet: 1 } },
  ]);
  listId = listId.map((e) => ({
    scheduleId: e.schedule._id,
    doctor: e?.doctor?.[0]?.name ? e?.doctor?.[0]?.name : "",
    packet: e?.packet?.[0]?.name ? e?.packet?.[0]?.name : "",
    clinic: e?.doctor?.[0]?.detail?.clinic?.name
      ? e?.doctor?.[0]?.detail?.clinic?.name
      : e?.packet?.[0]?.clinic?.name
      ? e?.packet?.[0]?.clinic?.name
      : "",
    specialty: e?.doctor?.[0]?.detail?.specialty?.name
      ? e?.doctor?.[0]?.detail?.specialty?.name
      : e?.packet?.[0]?.type?.specialty?.name
      ? e?.packet?.[0]?.type?.specialty?.name
      : "",
    detail: prescription,
    result: resultExam,
  }));
  listId = listId.map(async (e) => {
    await Prescription.findOneAndUpdate({ scheduleId: e.scheduleId }, e, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  });
  res.status(200).json({
    success: true,
  });
});

// api chat ai
exports.chatAi = catchAsyncErrors(async (req, res, next) => {
  const configuration = new Configuration({
    organization: "org-i16GdI3bivetsydNnhzCYRLs",
    apiKey: "sk-vWLs5wFhNHDCXkUFLDtHT3B'bkF hdkVpspFG4yNyOwM1A8O",
  });
  const openai = new OpenAIApi(configuration);

  const completion = await openai.createCompletion(
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say this is a test!" }],
      temperature: 0.7,
    },
    {
      timeout: 1000,
      headers: {
        "Example-Header": "example",
      },
    }
  );

  res.status(200).json({
    chat: completion.data.choices[0].text,
    success: true,
  });
});
