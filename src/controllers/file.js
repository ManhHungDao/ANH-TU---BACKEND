const multer = require("multer");
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");
const FileModel = require("../models/file");
import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import File from "../models/file.js";

exports.uploadFiles = catchAsyncErrors(async (req, res, next) => {
  try {
    let files = req.files;
    if (!files || files.length === 0) {
      console.log("🚀 ~ exports.uploadFiles=catchAsyncErrors ~ error:", error);
      return res.status(400).json({ message: "No files uploaded dsds" });
    }

    // Nếu chỉ có 1 file, Multer vẫn trả về mảng có 1 phần tử → không cần phân biệt
    const savedFiles = [];

    for (let file of files) {
      const filePath = file.path;

      // 👉 Chuyển Word sang HTML
      const result = await mammoth.convertToHtml({ path: filePath });
      const html = result.value;

      // 👉 Lưu vào MongoDB
      const newFile = new File({
        filename: file.originalname,
        content: html,
      });

      const savedFile = await newFile.save();
      savedFiles.push(savedFile);

      // 👉 (Tùy chọn) Xoá file gốc
      // fs.unlinkSync(filePath);
    }

    res.status(200).json({
      message: `${savedFiles.length} file(s) uploaded and processed successfully`,
      files: savedFiles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

//   const files = req.files;

//   if (!files || files.length === 0) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Không có file nào được tải lên." });
//   }

//   const savedFiles = [];

//   for (const file of files) {
//     // const filePath = path.join(__dirname, "../uploads", file.filename);

//     // Đọc và chuyển đổi file .docx sang HTML
//     const result = await mammoth.convertToHtml({ path: file.path });
//     const htmlContent = result.value;

//     // Lưu vào MongoDB
//     const savedFile = await File.create({
//       filename: file.originalname,
//       content: htmlContent,
//     });

//     savedFiles.push(savedFile);
//   }

//   res.status(200).json({
//     success: true,
//     message: "Đã lưu thành công tất cả file",
//     files: savedFiles,
//   });
// });
// exports.getDetailFile = catchAsyncErrors(async (req, res, next) => {});
// exports.updateFile = catchAsyncErrors(async (req, res, next) => {});
// exports.deleteFile = catchAsyncErrors(async (req, res, next) => {});
// exports.downloadFile = catchAsyncErrors(async (req, res, next) => {});

exports.getAll = catchAsyncErrors(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // Trang hiện tại
    const size = parseInt(req.query.size) || 10; // Số lượng mỗi trang
    const filterName = req.query.filter || ""; // Lọc theo tên file
    const typeId = req.query.type || ""; // Lọc theo loại án

    const skip = (page - 1) * size;

    // Xây dựng điều kiện lọc động
    const query = {};
    if (filterName) {
      query.filename = { $regex: filterName, $options: "i" }; // Tìm gần đúng không phân biệt hoa thường
    }
    if (typeId) {
      query.type = typeId; // Tìm chính xác theo ObjectId loại án
    }

    const [totalItems, files] = await Promise.all([
      File.countDocuments(query),
      File.find(query)
        .populate("type") // Lấy đầy đủ thông tin loại án liên kết
        .sort({ createdAt: -1 }) // Mới nhất trước
        .skip(skip)
        .limit(size),
    ]);

    res.status(200).json({
      errCode: 0,
      message: "Lấy danh sách files thành công",
      data: files,
      pagination: {
        totalItems,
        currentPage: page,
        pageSize: size,
        totalPages: Math.ceil(totalItems / size),
      },
    });
  } catch (err) {
    console.error("🚀 ~ GetAll Files API Error:", err);
    res.status(500).json({
      errCode: 1,
      message: "Lấy danh sách files thất bại",
    });
  }
});

exports.getDetailFile = catchAsyncErrors(async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        errCode: 3,
        message: "Missing file ID",
      });
    }
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        errCode: 1,
        message: "File not found",
      });
    }

    res.status(200).json({
      errCode: 0,
      message: "Get file succeed",
      data: file,
    });
  } catch (err) {
    console.log("🚀 ~ exports.getOne error:", err);
    res.status(500).json({
      errCode: 2,
      message: "Get file failed",
    });
  }
});

exports.deleteOne = catchAsyncErrors(async (req, res, next) => {
  const fileId = req.params.id;

  try {
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        errCode: 1,
        message: "File not found",
      });
    }

    await File.findByIdAndDelete(fileId);

    res.status(200).json({
      errCode: 0,
      message: "Delete file succeed",
    });
  } catch (err) {
    console.log("🚀 ~ exports.deleteOne error:", err);
    res.status(500).json({
      errCode: 2,
      message: "Delete file failed",
    });
  }
});
