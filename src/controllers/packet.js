import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import cloudinary from "cloudinary";
import Packet from "../models/packet";
import moment from "moment";
import Schedule from "../models/schedule";

exports.create = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    image,
    type,
    clinic,
    price,
    introduce,
    detail,
    payment,
    specialty,
  } = req.body;
  if (!name) {
    return next(new ErrorHandler("Required name", 400));
  }
  if (!image) {
    return next(new ErrorHandler("Required image", 400));
  }
  if (!price) {
    return next(new ErrorHandler("Required price", 400));
  }
  if (!payment) {
    return next(new ErrorHandler("Required payment", 400));
  }
  if (!clinic) {
    return next(new ErrorHandler("Required clinic", 400));
  }
  if (!introduce) {
    return next(new ErrorHandler("Required introduce", 400));
  }
  if (!detail) {
    return next(new ErrorHandler("Required detail", 400));
  }
  if (!type) {
    return next(new ErrorHandler("Required type", 400));
  }
  if (!specialty) {
    return next(new ErrorHandler("Required specialty", 400));
  }
  const result = await cloudinary.v2.uploader.upload(image, {
    folder: "packet",
  });
  const packet = await Packet.create({
    name,
    image: {
      public_id: result.public_id,
      url: result.secure_url,
    },
    type: {
      typeCode: type,
      specialty: specialty,
    },
    clinic,
    price,
    payment,
    introduce,
    detail,
  });
  res.status(200).json({
    packet,
    success: true,
  });
});

exports.update = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;
  if (!id) return next(new ErrorHandler("Required id", 400));
  let packet = await Packet.findById(id);
  if (!packet) {
    return next(new ErrorHandler("Packet not Found", 404));
  }
  if (req.body.image !== null) {
    await cloudinary.v2.uploader.destroy(packet.image.public_id);
    const result = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "packet",
    });
    req.body.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } else
    req.body.image = {
      ...packet.image,
    };
  packet = await Packet.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    packet,
    success: true,
  });
});

exports.remove = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Required packet id", 400));
  }

  let packet = await Packet.findById(id);

  if (!packet) {
    return next(new ErrorHandler("Packet not Found", 404));
  }

  cloudinary.v2.uploader.destroy(packet.image.public_id);

  let theNextDay = moment(new Date()).add(1, "days").startOf("day").valueOf();
  let query = {
    "packet.id": id,
    date: { $gte: theNextDay / 1000 },
  };

  await Schedule.deleteMany(query);
  await Packet.deleteOne({
    _id: id,
  });
  res.status(200).json({
    message: "Packet deleted successfully",
    success: true,
  });
});

exports.getSingle = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Required packet id", 400));
  }
  const packet = await Packet.findById(id);
  if (!packet) {
    return next(new ErrorHandler("Packet not Found", 404));
  }
  res.status(200).json({
    packet,
    success: true,
  });
});

exports.getAll = catchAsyncErrors(async (req, res, next) => {
  let { page, size, sort, filter, clinicId, type } = req.query;
  page = parseInt(page);
  if (!page) {
    page = 1;
  }
  size = parseInt(size);
  if (!size) {
    size = 10;
  }
  let length = 0;
  let packets = null;
  if (type && clinicId) {
    packets = await Packet.find({
      "clinic.id": clinicId,
      "type.typeCode.id": type,
    })
      .skip(size * page - size)
      .limit(size);
    length = await Packet.find({
      "clinic.id": clinicId,
      "type.typeCode.id": type,
    }).count();
  } else if (type) {
    packets = await Packet.find({
      "type.typeCode.id": type,
    })
      .skip(size * page - size)
      .limit(size);
    length = await Packet.find({
      "type.typeCode.id": type,
    }).count();
  } else if (clinicId) {
    packets = await Packet.find({
      "clinic.id": clinicId,
    })
      .skip(size * page - size)
      .limit(size);
    length = await Packet.find({
      "clinic.id": clinicId,
    }).count();
  } else if (filter) {
    packets = await Packet.find({
      name: {
        $regex: filter,
        $options: "i",
      },
    })
      .skip(size * page - size)
      .limit(size);
    length = await Packet.find({
      name: {
        $regex: filter,
        $options: "i",
      },
    }).count();
  } else {
    packets = await Packet.find({ roleId: { $not: { $regex: "R0" } } })
      .select("-password")
      .skip(size * page - size)
      .limit(size);
    length = await Packet.count();
  }

  res.status(200).json({
    packets,
    count: length,
    success: true,
  });
});
