import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import cloudinary from "cloudinary";
import Handbook from "../models/handbook";
import _ from "lodash";

exports.create = catchAsyncErrors(async (req, res, next) => {
  let { name, note, image, detail, clinic, specialty } = req.body;
  if (_.isEmpty(clinic) === true)
    clinic = {
      id: null,
      name: null,
    };
  if (!name) {
    return next(new ErrorHandler("Required name", 400));
  }
  if (!note) {
    return next(new ErrorHandler("Required note", 400));
  }
  if (!image) {
    return next(new ErrorHandler("Required image", 400));
  }
  if (!detail) {
    return next(new ErrorHandler("Required detail", 400));
  }
  if (!specialty) {
    return next(new ErrorHandler("Required specialty", 400));
  }
  const result = await cloudinary.v2.uploader.upload(image, {
    folder: "handbook",
  });
  const handbook = await Handbook.create({
    name,
    note,
    image: {
      public_id: result.public_id,
      url: result.secure_url,
    },
    detail,
    specialty,
    clinic: clinic,
  });
  res.status(200).json({
    handbook,
    success: true,
  });
});

exports.update = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Required handbook id", 400));
  }
  let handbook = await Handbook.findById(id);
  if (!handbook) {
    return next(new ErrorHandler("Handbook not Found", 404));
  }
  if (req.body.image !== null) {
    await cloudinary.v2.uploader.destroy(handbook.image.public_id);
    const result = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "handbook",
    });
    req.body.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } else {
    req.body.image = {
      ...handbook.image,
    };
  }
  handbook = await Handbook.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    handbook,
    success: true,
  });
});

exports.remove = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Required handbook id", 400));
  }
  const handbook = await Handbook.findById(id);
  if (!handbook) {
    return next(new ErrorHandler("Handbook not Found", 404));
  }
  cloudinary.v2.uploader.destroy(handbook.image.public_id);
  await Handbook.deleteOne({
    _id: id,
  });
  res.status(200).json({
    message: "Handbook deleted successfully",
    success: true,
  });
});

exports.getSingle = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) return next(new ErrorHandler("Required handbook id", 400));
  const handbook = await Handbook.findById(id);
  if (!handbook) {
    return next(new ErrorHandler("Handbook not Found", 404));
  }
  res.status(200).json({
    handbook,
    success: true,
  });
});

exports.getAll = catchAsyncErrors(async (req, res, next) => {

  let { page, size, sort, filter, specialtyId } = req.query;
  page = parseInt(page);
  if (!page) {
    page = 1;
  }
  size = parseInt(size);
  if (!size) {
    size = 10;
  }
  let length = 0;
  let handbooks = null;
  if (specialtyId) {
    handbooks = await Handbook.find({
      "specialty.id": specialtyId,
    })
      .skip(size * page - size)
      .limit(size);
    length = await Handbook.find({
      "specialty.id": specialtyId,
    }).count();
  } else if (filter) {
    handbooks = await Handbook.find({
      name: {
        $regex: filter,
        $options: "i",
      },
    })
      .skip(size * page - size)
      .limit(size);
    length = await Handbook.find({
      name: {
        $regex: filter,
        $options: "i",
      },
    }).count();
  } else {
    handbooks = await Handbook.find()
      .skip(size * page - size)
      .limit(size);
    length = await Handbook.count();
  }
  res.status(200).json({
    handbooks,
    success: true,
    count: length,
  });
});

exports.getAllHomePatient = catchAsyncErrors(async (req, res, next) => {
  let { page, size, sort, filter, specialtyId } = req.query;
  page = parseInt(page);
  if (!page) {
    page = 1;
  }
  size = parseInt(size);
  if (!size) {
    size = 10;
  }
  let length = 0;
  let handbooks = null;
  if (specialtyId) {
    handbooks = await Handbook.find({
      "specialty.id": specialtyId,
    },"name image")
      .skip(size * page - size)
      .limit(size);
    length = await Handbook.find({
      "specialty.id": specialtyId,
    }).count();
  } else if (filter) {
    handbooks = await Handbook.find({
      name: {
        $regex: filter,
        $options: "i",
      },
    },"name image")
      .skip(size * page - size)
      .limit(size);
    length = await Handbook.find({
      name: {
        $regex: filter,
        $options: "i",
      },
    }).count();
  } else {
    handbooks = await Handbook.find().select("name image")
      .skip(size * page - size)
      .limit(size);
    length = await Handbook.count();
  }
  res.status(200).json({
    handbooks,
    success: true,
    count: length,
  });
});

exports.getRelated = catchAsyncErrors(async (req, res, next) => {
  let { page, size, sort, specialtyId } = req.query;
  page = parseInt(page);
  if (!page) {
    page = 1;
  }
  size = parseInt(size);
  if (!size) {
    size = 10;
  }
  let length = 0;
  let handbooks = null;
  handbooks = await Handbook.find(
    { "specialty.id": specialtyId },
    "name image",
    { skip: size * page - size, limit: size }
  );
  length = await Handbook.find({ "specialty.id": specialtyId }).count();
  res.status(200).json({
    handbooks,
    success: true,
    count: length,
  });
});

exports.getAllSpecialty = catchAsyncErrors(async (req, res, next) => {
  let list = await Handbook.aggregate([
    { $group: { _id: { key: "$specialty.id", value: "$specialty.name" } } },
  ]);

  list = list.map((item) => ({ id: item._id.key, name: item._id.value }));
  res.status(200).json({
    list,
    success: true,
  });
});
