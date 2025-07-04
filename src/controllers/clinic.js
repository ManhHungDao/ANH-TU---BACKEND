import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import cloudinary from "cloudinary";
import Clinic from "../models/clinic";
import Specialty from "../models/specialty";
import User from "../models/user";
import Handbook from "../models/handbook";
import Packet from "../models/packet";
import Patient from "../models/patient";
import _ from "lodash";
import getDistance from "geolib/es/getDistance";

exports.create = catchAsyncErrors(async (req, res, next) => {
  const { name, image, logo, introduce, detail, address } = req.body;

  if (!name) {
    return next(new ErrorHandler("Required name", 400));
  }
  if (!address) {
    return next(new ErrorHandler("Required address", 400));
  }
  if (!image) {
    return next(new ErrorHandler("Required image", 400));
  }
  if (!logo) {
    return next(new ErrorHandler("Required logo", 400));
  }
  if (!introduce) {
    return next(new ErrorHandler("Required introduce", 400));
  }
  if (!detail) {
    return next(new ErrorHandler("Required detail", 400));
  }

  const resultImg = await cloudinary.v2.uploader.upload(image, {
    folder: "clinic",
  });
  const resultLogo = await cloudinary.v2.uploader.upload(logo, {
    folder: "clinic",
    width: 250,
  });
  const createClinic = await Clinic.create({
    name,
    image: {
      public_id: resultImg.public_id,
      url: resultImg.secure_url,
    },
    logo: {
      public_id: resultLogo.public_id,
      url: resultLogo.secure_url,
    },
    address,
    introduce,
    detail,
  });
  res.status(200).json({
    createClinic,
    success: true,
  });
});

exports.update = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Required clinic id", 400));
  }
  let clinic = await Clinic.findById(id);
  if (!clinic) {
    return next(new ErrorHandler("Clinic not Found", 404));
  }

  if (req.body.image !== null) {
    cloudinary.v2.uploader.destroy(clinic.image.public_id);
    let resultImg = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "clinic",
    });
    req.body.image = {
      public_id: resultImg.public_id,
      url: resultImg.secure_url,
    };
  } else
    req.body.image = {
      ...clinic.image,
    };

  if (req.body.logo !== null) {
    cloudinary.v2.uploader.destroy(clinic.logo.public_id);
    let resultLogo = await cloudinary.v2.uploader.upload(req.body.logo, {
      folder: "clinic",
      width: 250,
    });
    req.body.logo = {
      public_id: resultLogo.public_id,
      url: resultLogo.secure_url,
    };
  } else
    req.body.logo = {
      ...clinic.logo,
    };
  clinic = await Clinic.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    clinic,
    success: true,
  });
});

exports.remove = catchAsyncErrors(async (req, res, next) => {
  const id = req.query.id;
  if (!id) {
    return next(new ErrorHandler("Required clinic id", 400));
  }
  let clinic = await Clinic.findById(id);
  if (!clinic) {
    return next(new ErrorHandler("Clinic not Found", 404));
  }

  // xóa người dùng thuộc bệnh viên
  await User.find({ "detail.clinic.id": clinic._id }).then(async (users) => {
    if (!_.isEmpty(users)) {
      users.map((user) => cloudinary.v2.uploader.destroy(user.image.public_id));
      await User.deleteMany({
        "detail.clinic.id": clinic._id,
      });
    }
  });

  // xóa các chuyên khoa thuộc bệnh viện
  await Specialty.find({ "clinic.id": clinic._id }).then(
    async (specialties) => {
      if (!_.isEmpty(specialties)) {
        specialties.map((specialty) =>
          cloudinary.v2.uploader.destroy(specialty.image.public_id)
        );
        await Specialty.deleteMany({
          "clinic.id": clinic._id,
        });
      }
    }
  );

  // xóa các gói khám thuộc bệnh viện
  await Packet.find({ "clinic.id": clinic._id }).then(async (packets) => {
    if (!_.isEmpty(packets)) {
      packets.map((packet) =>
        cloudinary.v2.uploader.destroy(packet.image.public_id)
      );
      await Packet.deleteMany({ "clinic.id": clinic._id });
    }
  });

  // xóa các bài đăng thuộc bệnh viện
  await Handbook.find({ "clinic.id": clinic._id }).then(async (handbooks) => {
    if (!_.isEmpty(handbooks)) {
      handbooks.map((handbook) =>
        cloudinary.v2.uploader.destroy(handbook.image.public_id)
      );
      await Handbook.deleteMany({ "clinic.id": clinic._id });
    }
  });

  cloudinary.v2.uploader.destroy(clinic.image.public_id);
  cloudinary.v2.uploader.destroy(clinic.logo.public_id);
  await Clinic.deleteOne({
    _id: id,
  });
  res.status(200).json({
    message: "Clinic deleted successfully",
    success: true,
  });
});

exports.getSingle = catchAsyncErrors(async (req, res, next) => {
  const clinic = await Clinic.findById(req.query.id);
  if (!clinic) {
    return next(new ErrorHandler("Clinic not Found", 404));
  }
  res.status(200).json({
    clinic,
    success: true,
  });
});

exports.getAll = catchAsyncErrors(async (req, res, next) => {
  let { page, size, sort, filter } = req.query;
  if (!page) {
    page = 1;
  }
  size = parseInt(size);
  if (!size) {
    size = 10;
  }
  let length = "";
  let clinics = null;
  if (filter) {
    clinics = await Clinic.find({
      name: {
        $regex: filter,
        $options: "i",
      },
    })
      .skip(size * page - size)
      .limit(size);
    length = await Clinic.find({
      name: {
        $regex: filter,
        $options: "i",
      },
    }).count();
  } else {
    // {
    //   $facet: {
    //     response: [{ $skip: count * page }, { $limit: count }],
    //     pagination: [
    //       {
    //         $count: 'totalDocs',
    //       },
    //       {
    //         $addFields: {
    //           page: page + 1,
    //           totalPages: {
    //             $floor: {
    //               $divide: ['$totalDocs', count],
    //             },
    //           },
    //         },
    //       },
    //     ],
    //   },
    // },

    // [clinics] = await Clinic.aggregate([
    //   {
    //     $facet: {
    //       response: [{ $skip: size * page - size }, { $limit: size }],
    //       pagination:[ {
    //         $count: "count",
    //       }],
    //     },
    //   },
    // ]);

    clinics = await Clinic.find()
      .skip(size * page - size)
      .limit(size);
    length = await Clinic.count();
  }
  res.status(200).json({
    clinics,
    success: true,
    count: length,
  });
});

exports.getAllHomePatient = catchAsyncErrors(async (req, res, next) => {
  const clinics = await Clinic.find().sort({ views: -1 }).select("name image");
  res.status(200).json({
    clinics,
    success: true,
  });
});

exports.suggestNearestClinic = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.query;
  if (!id) {
    return next(new ErrorHandler("Required user id", 400));
  }
  const patient = await Patient.findById(id).select("address");
  const clinics = await Clinic.find({});
  let dataPoints = clinics.map((e) => ({
    id: e._id,
    name: e.name,
    image: e.image,
    latitude: e.address.lat,
    longitude: e.address.lng,
  }));

  const myLocation = {
    latitude: patient.address.lat,
    longitude: patient.address.lng,
  };

  const distances = dataPoints.map((point) => {
    let data = {
      latitude: point.latitude,
      longitude: point.longitude,
    };
    let distance = getDistance(data, myLocation) / 1000;
    return {
      point,
      distance,
    };
  });

  let nearestClinics = distances.sort((a, b) => a.distance - b.distance);
  nearestClinics = nearestClinics.map((e) => ({
    _id: e.point.id,
    name: e.point.name,
    image: e.point.image,
    distance: e.distance,
  }));
  res.status(200).json({
    success: true,
    nearestClinics,
  });
});

exports.increatmentViews = catchAsyncErrors(async (req, res, next) => {
  let clinic = await Clinic.findById(req.query.id);
  if (!clinic) {
    return next(new ErrorHandler("Clinic not Found", 404));
  }
  clinic.views++;
  await clinic.save();
  res.status(200).json({
    clinic,
    success: true,
  });
});

exports.getAllProvince = catchAsyncErrors(async (req, res, next) => {
  let list = await Clinic.aggregate([{ $group: { _id: "$address.province" } }]);
  res.status(200).json({
    list,
    success: true,
  });
});
