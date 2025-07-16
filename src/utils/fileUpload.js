// utils/fileUpload.js
const multer = require("multer");
const path = require("path");

// Cấu hình lưu trữ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu trữ file
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    ); // Đặt tên file
  },
});

// Tạo middleware multer
const upload = multer({ storage: storage });

module.exports = upload;
