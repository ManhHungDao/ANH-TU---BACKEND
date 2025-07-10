const mammoth = require("mammoth");
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import File from "../models/file.js";
const htmlToDocx = require("html-to-docx");

exports.uploadFiles = catchAsyncErrors(async (req, res, next) => {
  try {
    let files = req.files;
    let type = req.body.type;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    if (!type) {
      return res.status(400).json({ message: "No type uploaded" });
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
        type,
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

exports.deleteFile = catchAsyncErrors(async (req, res, next) => {
  const fileId = req.params.id;
  console.log("🚀 ~ exports.deleteOne ~ fileId:", fileId);

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
    res.status(500).json({
      errCode: 2,
      message: "Delete file failed",
    });
  }
});

exports.updateFile = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id, content } = req.body;

    if (!id || !content) {
      return res.status(400).json({
        errCode: 1,
        message: "Thiếu ID hoặc nội dung file",
      });
    }

    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({
        errCode: 2,
        message: "Không tìm thấy file",
      });
    }

    file.content = content;
    await file.save();

    res.status(200).json({
      errCode: 0,
      message: "Cập nhật nội dung file thành công",
      data: file,
    });
  } catch (error) {
    console.error("🚀 ~ updateFile error:", error);
    res.status(500).json({
      errCode: 3,
      message: "Cập nhật thất bại",
    });
  }
});

exports.downloadFile = catchAsyncErrors(async (req, res, next) => {
  try {
    const id = req.params.id;
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        errCode: 1,
        message: "Không tìm thấy file",
      });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${file.filename}</title>
      </head>
      <body>
        ${file.content || "<p>Không có nội dung</p>"}
      </body>
      </html>
    `;

    // 👉 Chuyển HTML sang DOCX Buffer (CHUẨN NODEJS)
    const docxBuffer = await htmlToDocx(htmlContent);

    const filename = `${file.filename || "download"}.docx`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    res.end(docxBuffer);
  } catch (error) {
    console.error("❌ Lỗi khi export DOCX:", error);
    res.status(500).json({
      errCode: 2,
      message: "Xuất file thất bại",
    });
  }
});
