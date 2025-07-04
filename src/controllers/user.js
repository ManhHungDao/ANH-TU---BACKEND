import User from "../models/user";
import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import cloudinary from "cloudinary";
import sendToken from "../utils/jwtToken";
import moment from "moment";
import Schedule from "../models/schedule";
import Clinic from "../models/clinic";
import Specialty from "../models/specialty";
import Role from "../models/role";

exports.create = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    email,
    image,
    password,
    gender,
    phone,
    position,
    dateOfBirth,
    specialty,
    clinic,
    price,
    payment,
    introduce,
    note,
    detail,
    address,
  } = req.body;
  if (!name) {
    return next(new ErrorHandler("Required name", 400));
  }
  if (!email) {
    return next(new ErrorHandler("Required email", 400));
  }
  if (!image) {
    return next(new ErrorHandler("Required image", 400));
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
  if (!position) {
    return next(new ErrorHandler("Required position", 400));
  }
  if (!dateOfBirth) {
    return next(new ErrorHandler("Required day of birth", 400));
  }
  if (!address) {
    return next(new ErrorHandler("Required address", 400));
  }
  if (!clinic) {
    return next(new ErrorHandler("Required clinic", 400));
  }
  if (!specialty) {
    return next(new ErrorHandler("Required specialty", 400));
  }
  if (!price) {
    return next(new ErrorHandler("Required price", 400));
  }
  if (!payment) {
    return next(new ErrorHandler("Required payment", 400));
  }
  if (!detail) {
    return next(new ErrorHandler("Required detail", 400));
  }
  if (!introduce) {
    return next(new ErrorHandler("Required introduce", 400));
  }
  // if (!note) {
  //   return next(new ErrorHandler("Required note", 400));
  // }
  const result = await cloudinary.v2.uploader.upload(image, {
    folder: "user",
    width: 150,
  });
  const createUser = await User.create({
    email,
    name,
    image: {
      public_id: result.public_id,
      url: result.secure_url,
    },
    password,
    gender,
    phone,
    dateOfBirth,
    roleId: "R3",
    address,
    detail: {
      clinic,
      specialty,
      position,
      price,
      payment,
      introduce,
      note: note || null,
      detail,
    },
  });
  sendToken(createUser, 200, res);

  // res.status(200).json({
  //   createUser,
  //   success: true,
  // });
});

exports.remove = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Required user id", 400));
  }
  let user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("User not Found", 404));
  }

  cloudinary.v2.uploader.destroy(user.image.public_id);
  // kiểm tra ngày trong tương lai có lịch hay không, nếu có thì xóa lịch
  let theNextDay = moment(new Date()).add(1, "days").startOf("day").valueOf();
  let query = {
    "doctor.id": id,
    date: { $gte: theNextDay / 1000 },
  };
  await Schedule.deleteMany(query);
  await User.deleteOne({
    _id: id,
  });
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

exports.update = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Required user id", 400));
  }
  let user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("User not Found", 404));
  }
  if (req.body.image !== null) {
    await cloudinary.v2.uploader.destroy(user.image.public_id);
    const result = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "user",
      width: 150,
      crop: "scale",
    });
    req.body.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } else
    req.body.image = {
      ...user.image,
    };
  user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    user,
    success: true,
  });
});

exports.getSingle = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Required handbook id", 400));
  }
  const user = await User.findById(id).select("-password");
  if (!user) {
    return next(new ErrorHandler("User not Found", 404));
  }
  res.status(200).json({
    user,
    success: true,
  });
});

exports.getAll = catchAsyncErrors(async (req, res, next) => {
  let { page, size, sort, filter, clinicId } = req.query;
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

  if (clinicId) {
    users = await User.find(
      {
        "detail.clinic.id": clinicId,
        roleId: { $not: { $regex: "R0" } },
      },
      "-password"
    )
      .skip(size * page - size)
      .limit(size);
    length = await User.find(
      {
        "detail.clinic.id": clinicId,
        roleId: { $not: { $regex: "R0" } },
      },
      "-password"
    ).count();
  } else if (filter) {
    users = await User.find(
      {
        name: {
          $regex: filter,
          $options: "i",
        },
        roleId: { $not: { $regex: "R0" } },
      },
      "-password"
    )
      .skip(size * page - size)
      .limit(size);
    length = await User.find(
      {
        name: {
          $regex: filter,
          $options: "i",
        },
        roleId: { $not: { $regex: "R0" } },
      },
      "-password"
    ).count();
  } else {
    users = await User.find({ roleId: { $not: { $regex: "R0" } } })
      .select("-password")
      .skip(size * page - size)
      .limit(size);
    length = await User.find({ roleId: { $not: { $regex: "R0" } } }).count();
  }

  res.status(200).json({
    users,
    success: true,
    count: length,
  });
});

exports.getAllHomePatient = catchAsyncErrors(async (req, res, next) => {
  let { page, size, sort, filter, clinicId } = req.query;
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
    users = await User.find(
      {
        name: {
          $regex: filter,
          $options: "i",
        },
        roleId: { $not: { $regex: "R0" } },
      },
      "name image detail.specialty.name detail.position.name"
    );
  } else
    users = await User.find({})
      .select("name image detail.specialty.name detail.position.name")
      .skip(0)
      .limit(20);
  res.status(200).json({
    users,
    success: true,
  });
});

// lấy ra danh sách bác sĩ thuộc chuyên khoa - hiển thị trong chuyên khoa khi người dùng nhấn chọn
exports.getAllDoctorBySpecialtyHome = catchAsyncErrors(
  async (req, res, next) => {
    let { page, size, id } = req.query;

    if (!id) {
      return next(new ErrorHandler("Required specilaty id", 400));
    }

    page = parseInt(page);
    if (!page) {
      page = 1;
    }
    size = parseInt(size);
    if (!size) {
      size = 10;
    }

    let users = await User.find(
      {
        "detail.specialty.id": id,
        roleId: { $not: { $regex: "R0" } },
      },
      "name"
    )
      .skip(size * page - size)
      .limit(size);
    let length = await User.find({
      "detail.specialty.id": id,
      roleId: { $not: { $regex: "R0" } },
    }).count();
    res.status(200).json({
      users,
      count: length,
      success: true,
    });
  }
);

// lấy ra danh sách bác sĩ thuộc chuyên khoa nằm trong bệnh viện đã chọn
exports.getAllDoctorBySpecialtyOfClinicHome = catchAsyncErrors(
  async (req, res, next) => {
    let { page, size, clinicId, specialtyId } = req.query;

    if (!clinicId) {
      return next(new ErrorHandler("Required clinic id", 400));
    }

    if (!specialtyId) {
      return next(new ErrorHandler("Required specialty id", 400));
    }
    page = parseInt(page);
    if (!page) {
      page = 1;
    }
    size = parseInt(size);
    if (!size) {
      size = 10;
    }

    let users = await User.find(
      {
        "detail.clinic.id": clinicId,
        "detail.specialty.id": specialtyId,
        roleId: { $not: { $regex: "R0" } },
      },
      "name"
    )
      .skip(size * page - size)
      .limit(size);
    let length = await User.find({
      "detail.clinic.id": clinicId,
      "detail.specialty.id": specialtyId,
      roleId: { $not: { $regex: "R0" } },
    }).count();
    res.status(200).json({
      users,
      count: length,
      success: true,
    });
  }
);

/* lọc ra những bác sĩ thuộc thành phố đã chọn*/
exports.getAllDoctorByProvince = catchAsyncErrors(async (req, res, next) => {
  let { page, size, id, province } = req.query;

  if (!id) {
    return next(new ErrorHandler("Required specilaty id", 400));
  }
  if (!province) {
    return next(new ErrorHandler("Required province", 400));
  }
  page = parseInt(page);
  if (!page) {
    page = 1;
  }
  size = parseInt(size);
  if (!size) {
    size = 10;
  }

  // lấy tất cả phòng khám thuộc thành phố đã chọn
  const clinic = await Clinic.find({ "address.province": province }, "name");

  const clinicIds = clinic.map((e) => e._id);
  // lấy người dùng nằm trong bệnh viện đã lọc và có id chuyên khoa bằng với chuyên khoa đã chọn
  const users = await User.find(
    {
      "detail.clinic.id": { $in: clinicIds },
      "detail.specialty.id": id,
    },
    "name"
  )
    .skip(size * page - size)
    .limit(size);

  const length = await User.find(
    {
      "detail.clinic.id": { $in: clinicIds },
      "detail.specialty.id": id,
    },
    "name"
  ).count();

  res.status(200).json({
    users,
    count: length,
    success: true,
  });
});

exports.suggestDoctorRecent = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.query;
  if (!email) {
    return next(new ErrorHandler("Required user email", 400));
  }
  let doctorsRecent = await Schedule.aggregate([
    {
      $match: { "packet.id": null },
    },
    {
      $unwind: "$schedule",
    },
    {
      $match: {
        // "schedule.status": "Hoàn thành",
        "schedule.user.email": email,
      },
    },
    { $group: { _id: { id: "$doctor.id", name: "$doctor.name" } } },
    { $skip: 0 },
    { $limit: 20 },
    {
      $lookup: {
        from: "users",
        localField: "_id.id",
        foreignField: "_id",
        pipeline: [
          {
            $match: { _id: { $ne: null } },
          },
        ],
        as: "doctor",
      },
    },
    {
      $project: {
        _id: 1,
        "doctor.image": 1,
        "doctor.detail.specialty.name": 1,
        "doctor.detail.position.name": 1,
      },
    },
  ]);

  doctorsRecent = doctorsRecent.map((e) => ({
    _id: e._id.id,
    name: e._id.name,
    // ...e,
    image: e.doctor[0].image,
    detail: e.doctor[0].detail,
  }));

  if (doctorsRecent.length < 20) {
    const thirtyDaysAgo = moment(new Date())
      .subtract(30, "days")
      .startOf("day")
      .valueOf();
    let listDoctorSchedule = await Schedule.aggregate([
      {
        $match: {
          date: { $gt: thirtyDaysAgo / 1000 + "" },
          "doctor.id": { $ne: null },
        },
      },
      {
        $group: {
          _id: { doctor: "$doctor" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $skip: 0 },
      { $limit: 20 },
      {
        $lookup: {
          from: "users",
          localField: "_id.doctor.id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $project: {
          _id: 1,
          "doctor.image": 1,
          "doctor.detail.specialty.name": 1,
          "doctor.detail.position.name": 1,
        },
      },
    ]);
    let outStandingDoctor = listDoctorSchedule.map((e) => ({
      _id: e._id.doctor.id,
      name: e._id.doctor.name,
      image: e?.doctor[0]?.image ? e.doctor[0].image : "",
      detail: e?.doctor[0]?.detail,
    }));

    const result = outStandingDoctor.filter((element) => {
      const index = doctorsRecent.findIndex(
        (obj) => obj._id.toString() === element._id.toString()
      );
      return index === -1;
    });
    doctorsRecent = doctorsRecent.concat(result);
  }

  res.status(200).json({
    count: doctorsRecent.length,
    doctorsRecent: doctorsRecent.slice(0, 20),
    success: true,
  });
});

exports.outStandingDoctor = catchAsyncErrors(async (req, res, next) => {
  const thirtyDaysAgo = moment(new Date())
    .subtract(30, "days")
    .startOf("day")
    .valueOf();

  let listDoctorSchedule = await Schedule.aggregate([
    {
      $match: {
        date: { $gt: thirtyDaysAgo / 1000 + "" },
        "doctor.id": { $ne: null },
      },
    },
    {
      $group: {
        _id: { doctor: "$doctor" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $skip: 0 },
    { $limit: 20 },
    {
      $lookup: {
        from: "users",
        localField: "_id.doctor.id",
        foreignField: "_id",
        as: "doctor",
      },
    },
    {
      $project: {
        _id: 1,
        "doctor.image": 1,
        "doctor.detail.specialty.name": 1,
        "doctor.detail.position.name": 1,
      },
    },
  ]);
  let outStandingDoctor = listDoctorSchedule.map((e) => ({
    _id: e._id.doctor.id,
    name: e._id.doctor.name,
    image: e?.doctor[0]?.image ? e.doctor[0].image : "",
    detail: e?.doctor[0]?.detail,
  }));

  res.status(200).json({
    success: true,
    outStandingDoctor,
  });
});

exports.getAllManager = catchAsyncErrors(async (req, res, next) => {
  const managers = await User.find(
    { roleId: "R2" },
    "image email name detail.clinic detail.specialty"
  );
  res.status(200).json({
    success: true,
    managers,
  });
});
