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
    console.error("dsadsad");
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
