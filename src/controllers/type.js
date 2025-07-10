const Type = require("../models/type");
const File = require("../models/file");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

// 📌 Lấy tất cả loại án
exports.getAllTypes = catchAsyncErrors(async (req, res, next) => {
  const types = await Type.find().sort({ createdAt: -1 });
  res.status(200).json({
    errCode: 0,
    message: "Lấy danh sách loại án thành công",
    data: types,
  });
});

// 📌 Thêm mới loại án
exports.createType = catchAsyncErrors(async (req, res, next) => {
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({
      errCode: 1,
      message: "Tên loại án không được để trống",
    });
  }

  const trimmedName = name.trim();

  const existingType = await Type.findOne({ type: trimmedName });
  if (existingType) {
    return res.status(400).json({
      errCode: 2,
      message: "Loại án đã tồn tại",
    });
  }

  const newType = await Type.create({ type: trimmedName });

  res.status(201).json({
    errCode: 0,
    message: "Tạo loại án thành công",
    data: newType,
  });
});

// 📌 Xoá loại án theo ID
exports.deleteType = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const type = await Type.findById(id);
  if (!type) {
    return res.status(404).json({
      errCode: 1,
      message: "Không tìm thấy loại án",
    });
  }

  // 🔍 Kiểm tra xem có file nào đang dùng loại án này không
  const fileUsingType = await File.findOne({ type: id });

  if (fileUsingType) {
    return res.status(400).json({
      errCode: 2,
      message: "Không thể xoá loại án vì đang được sử dụng trong file",
    });
  }

  await Type.findByIdAndDelete(id);

  res.status(200).json({
    errCode: 0,
    message: "Xoá loại án thành công",
  });
});
