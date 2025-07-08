import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Clinic from "../models/clinic";
import _ from "lodash";
import getDistance from "geolib/es/getDistance";

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
