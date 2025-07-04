import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import cloudinary from "cloudinary";
import Specialty from "../models/specialty";
import User from "../models/user";
import Handbook from "../models/handbook";
import _ from "lodash";

exports.create = catchAsyncErrors(async (req, res, next) => {
  const { popular, name, clinic, image, detail, key } = req.body;
  if (!name) {
    return next(new ErrorHandler("Required name", 400));
  }
  if (!key) {
    return next(new ErrorHandler("Required key", 400));
  }
  if (!image) {
    return next(new ErrorHandler("Required image", 400));
  }

  let existed = null;
  if (popular === false) {
    existed = await Specialty.findOne({
      "clinic.id": clinic.id,
      key: key,
    });
  } else {
    existed = await Specialty.findOne({
      key: key,
      popular: true,
    });
  }
  if (existed !== null)
    return next(new ErrorHandler("Duplicate specialty", 400));
  const result = await cloudinary.v2.uploader.upload(image, {
    folder: "specialty",
    crop: "scale",
  });
  const specialty = await Specialty.create({
    name,
    image: {
      public_id: result.public_id,
      url: result.secure_url,
    },
    clinic,
    detail: detail ? detail : null,
    popular,
    key,
  });
  res.status(200).json({
    specialty,
    success: true,
  });
});

exports.update = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Required specialty id", 400));
  }
  let specialty = await Specialty.findById(id);
  if (!specialty) {
    return next(new ErrorHandler("Specialty not Found", 404));
  }
  if (req.body.image !== null) {
    await cloudinary.v2.uploader.destroy(specialty.image.public_id);
    const result = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "specialty",
    });
    req.body.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } else
    req.body.image = {
      ...specialty.image,
    };
  specialty = await Specialty.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    specialty,
    success: true,
  });
});

exports.remove = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Required specialty id", 400));
  }
  let specialty = await Specialty.findById(id);
  if (!specialty) {
    return next(new ErrorHandler("Specialty not Found", 404));
  }
  // const key = specialty.key;

  // kiểm tra chuyên khoa có tồn tại trong người dùng
  const user = await User.findOne({
    "detail.specialty.id": specialty.key,
    "detail.clinic.id": specialty.clinic.id,
  });
  if (user) return next(new ErrorHandler("Existed feild in other model", 500));
  // kiểm tra chuyên khoa có bài đăng - xóa tất cả bài đăng thuộc chuyên khoa
  if (specialty.popular === true) {
    // - xóa chuyên khoa nổi bật   popular:true , - handbook clinic.id:null
    await Handbook.find({
      "specialty.id": specialty.key,
      "clinic.id": null,
    }).then(async (handbooks) => {
      if (!_.isEmpty(handbooks)) {
        handbooks.map((handbook) =>
          cloudinary.v2.uploader.destroy(handbook.image.public_id)
        );
        await Handbook.deleteMany({
          "specialty.id": specialty.key,
          "clinic.id": null,
        });
      }
    });
  } else {
    // - xóa chuyên khoa    popular:false , - handbook clinic.id:!null
    await Handbook.find({
      "specialty.id": specialty.key,
      "clinic.id": specialty.clinic.id,
    }).then(async (handbooks) => {
      if (!_.isEmpty(handbooks)) {
        handbooks.map((handbook) =>
          cloudinary.v2.uploader.destroy(handbook.image.public_id)
        );
        await Handbook.deleteMany({
          "specialty.id": specialty.key,
          "clinic.id": specialty.clinic.id,
        });
      }
    });
  }

  cloudinary.v2.uploader.destroy(specialty.image.public_id);
  await Specialty.deleteOne({
    _id: id,
  });
  res.status(200).json({
    message: "Specialty deleted successfully",
    success: true,
  });
});

exports.getSingle = catchAsyncErrors(async (req, res, next) => {
  const specialty = await Specialty.findById(req.query.id);
  if (!specialty) {
    return next(new ErrorHandler("Specialty not Found", 404));
  }
  res.status(200).json({
    specialty,
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
  let specialties = null;
  if (clinicId) {
    specialties = await Specialty.find({
      "clinic.id": clinicId,
    })
      .skip(size * page - size)
      .limit(size);
    length = await Specialty.find({
      "clinic.id": clinicId,
    }).count();
  } else if (filter) {
    specialties = await Specialty.find({
      name: {
        $regex: filter,
        $options: "i",
      },
    });
    length = await Specialty.find({
      name: {
        $regex: filter,
        $options: "i",
      },
    }).count();
  } else {
    specialties = await Specialty.find({
      popular: true,
    })
      .skip(size * page - size)
      .limit(size);
    length = await Specialty.find({
      popular: true,
    }).count();
  }
  res.status(200).json({
    specialties,
    success: true,
    count: length,
  });
});

exports.getByClinicId = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Required clinic id", 400));
  }
  const specialties = await Specialty.find(
    {
      "clinic.id": id,
    },
    "_id name key"
  );
  res.status(200).json({
    specialties,
    success: true,
  });
});

exports.getPopularHome = catchAsyncErrors(async (req, res, next) => {
  let { filter } = req.query;
  let specialties = null;
  if (filter) {
    specialties = await Specialty.find(
      {
        name: {
          $regex: filter,
          $options: "i",
        },
        popular: true,
      },
      "_id name image key"
    );
  } else
    specialties = await Specialty.find(
      {
        popular: true,
      },
      "_id name image key"
    );
  res.status(200).json({
    specialties,
    success: true,
  });
});
