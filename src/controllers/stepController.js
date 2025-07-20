const Step = require("../models/Step");
const mongoose = require("mongoose");

// Tạo mới step với file đính kèm (upload)
exports.createStep = async (req, res) => {
  try {
    const { menu, title, content } = req.body;

    // 1. Kiểm tra bỏ trống
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Tên không được để trống." });
    }

    const cleanTitle = title.trim();

    // 2. Kiểm tra ký tự đặc biệt
    const invalidCharRegex = /[^a-zA-Z0-9\s\u00C0-\u1EF9]/; // Hỗ trợ unicode tiếng Việt
    if (invalidCharRegex.test(cleanTitle)) {
      return res
        .status(400)
        .json({ error: "Tên không được chứa ký tự đặc biệt." });
    }

    // 3. Kiểm tra trùng tên trong cùng menu
    const existingStep = await Step.findOne({
      menu: menu,
      title: { $regex: new RegExp(`^${cleanTitle}$`, "i") }, // Không phân biệt hoa thường
    });
    if (existingStep) {
      return res.status(400).json({ error: "Tên đã tồn tại trong menu này." });
    }

    // Tìm order lớn nhất trong cùng menu
    const lastStep = await Step.findOne({ menu: menu })
      .sort({ order: -1 })
      .exec();

    const nextOrder = lastStep ? lastStep.order + 1 : 1;

    const attachments = (req.files || []).map((file) => ({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      data: file.buffer,
    }));

    const newStep = new Step({
      menu: new mongoose.Types.ObjectId(menu),
      title: cleanTitle,
      content,
      order: nextOrder,
      attachments,
    });

    await newStep.save();
    res.status(201).json(newStep);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateStepTitle = async (req, res) => {
  try {
    const { id } = req.params; // Step ID
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Tên  không được để trống." });
    }

    const cleanTitle = title.trim();

    // Kiểm tra ký tự đặc biệt
    const invalidCharRegex = /[^a-zA-Z0-9\s\u00C0-\u1EF9]/; // Hỗ trợ unicode
    if (invalidCharRegex.test(cleanTitle)) {
      return res
        .status(400)
        .json({ error: "Tên  không được chứa ký tự đặc biệt." });
    }

    const currentStep = await Step.findById(id);
    if (!currentStep) {
      return res.status(404).json({ error: "Không tồn tại." });
    }

    // Kiểm tra trùng tên trong cùng menu (khác chính nó)
    const duplicateStep = await Step.findOne({
      menu: currentStep.menu,
      title: { $regex: new RegExp(`^${cleanTitle}$`, "i") },
      _id: { $ne: id },
    });

    if (duplicateStep) {
      return res.status(400).json({ error: "Tên  đã tồn tại trong menu này." });
    }

    currentStep.title = cleanTitle;
    await currentStep.save();

    res.json({ message: "Đổi tên  thành công.", step: currentStep });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật step và thay thế file đính kèm nếu có
exports.updateStep = async (req, res) => {
  try {
    const { title, content, order } = req.body;

    let updatedFields = { title, content, order };

    if (req.files && req.files.length > 0) {
      const attachments = req.files.map((file) => ({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        data: file.buffer,
      }));
      updatedFields.attachments = attachments;
    }

    const updatedStep = await Step.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    if (!updatedStep)
      return res.status(404).json({ message: "Step not found" });

    res.json(updatedStep);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Các hàm còn lại giữ nguyên
exports.getAllSteps = async (req, res) => {
  try {
    const filter = {};
    if (req.query.menu) filter.menu = req.query.menu;
    const steps = await Step.find(filter).sort({ order: 1 });
    res.json(steps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStepById = async (req, res) => {
  try {
    const step = await Step.findById(req.params.id);
    if (!step) return res.status(404).json({ message: "Step not found" });
    res.json(step);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteStep = async (req, res) => {
  try {
    const step = await Step.findByIdAndDelete(req.params.id);
    if (!step) return res.status(404).json({ message: "Step not found" });
    res.json({ message: "Step deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Controller đổi tên Step theo _id
exports.renameStep = async (req, res) => {
  try {
    const stepId = req.params.id; // ID Step cần đổi tên, từ params URL
    const { title } = req.body; // Tên mới lấy từ body

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Tên  không được để trống." });
    }

    // Cập nhật title của Step
    const updatedStep = await Step.findByIdAndUpdate(
      stepId,
      { title: title.trim() },
      { new: true } // trả về document mới cập nhật
    );

    if (!updatedStep) {
      return res.status(404).json({ error: "Step không tìm thấy." });
    }

    res.json(updatedStep);
  } catch (error) {
    console.error("Lỗi đổi tên step:", error);
    res.status(500).json({ error: "Lỗi máy chủ." });
  }
};

// Lấy danh sách file đính kèm của Step theo id
exports.getAttachments = async (req, res) => {
  try {
    const stepId = req.params.id;

    const step = await Step.findById(stepId).select("attachments");

    if (!step) {
      return res.status(404).json({ error: "Step không tìm thấy." });
    }

    const attachmentsInfo = step.attachments.map(({ filename, size }) => ({
      filename,
      size,
    }));

    res.json({ attachments: attachmentsInfo });
  } catch (error) {
    console.error("Lỗi lấy danh sách file đính kèm:", error);
    res.status(500).json({ error: "Lỗi máy chủ." });
  }
};

// API tải file đính kèm theo stepId và filename
exports.downloadAttachment = async (req, res) => {
  try {
    const { stepId, filename } = req.params;

    const step = await Step.findById(stepId).select("attachments");

    if (!step) {
      return res.status(404).json({ error: "Step không tìm thấy." });
    }

    const attachment = step.attachments.find(
      (att) => att.filename === filename
    );

    if (!attachment) {
      return res.status(404).json({ error: "File đính kèm không tìm thấy." });
    }

    res.set({
      "Content-Disposition": `attachment; filename="${attachment.filename}"`,
      "Content-Type": attachment.mimetype,
      "Content-Length": attachment.size,
    });

    // Gửi dữ liệu file nhị phân
    res.send(attachment.data);
  } catch (error) {
    console.error("Lỗi tải file đính kèm:", error);
    res.status(500).json({ error: "Lỗi máy chủ." });
  }
};

// xóa file deleteAttachment
exports.deleteAttachment = async (req, res) => {
  try {
    const { stepId, fileId } = req.params;

    const step = await Step.findById(stepId);
    if (!step) {
      return res.status(404).json({ error: "Không tìm thấy Step." });
    }

    // Lọc bỏ file có _id trùng với fileId
    step.attachments = step.attachments.filter(
      (file) => file._id.toString() !== fileId.toString()
    );

    await step.save();

    res.json({ success: true, message: "Đã xoá file đính kèm thành công." });
  } catch (error) {
    console.error("Lỗi xoá file đính kèm:", error);
    res.status(500).json({ error: "Xoá file đính kèm thất bại." });
  }
};
// add file to step
exports.addAttachmentToStep = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    // ✅ Kiểm tra danh sách file
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Không có file được tải lên." });
    }

    const step = await Step.findById(id);
    if (!step) {
      return res.status(404).json({ error: "Step không tồn tại." });
    }

    // ✅ Convert từng file thành attachment object
    const attachments = files.map((file) => ({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      data: file.buffer,
    }));

    // ✅ Thêm tất cả file vào step
    step.attachments.push(...attachments);
    await step.save();

    res.status(200).json({
      message: "Tệp đã được thêm thành công",
      attachments,
    });
  } catch (error) {
    console.error("Lỗi khi thêm file:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi khi thêm file" });
  }
};

// thay đổi nội dung content
exports.updateStepContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Nội dung không được để trống." });
    }

    const updatedStep = await Step.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );

    if (!updatedStep) {
      return res.status(404).json({ error: "Không tìm thấy step." });
    }

    return res.status(200).json(updatedStep);
  } catch (error) {
    console.error("Lỗi cập nhật nội dung step:", error);
    return res.status(500).json({ error: "Lỗi máy chủ." });
  }
};

// xem file
exports.getAttachmentFile = async (req, res) => {
  try {
    const { stepId, attachmentId } = req.params;

    const step = await Step.findById(stepId);
    if (!step) {
      return res.status(404).json({ error: "Không tìm thấy Step." });
    }

    const file = step.attachments.id(attachmentId);
    if (!file) {
      return res.status(404).json({ error: "Không tìm thấy file." });
    }

    res.set({
      "Content-Type": file.mimetype,
      "Content-Disposition": `inline; filename="${file.filename}"`,
    });

    res.send(file.data);
  } catch (error) {
    console.error("Lỗi khi tải file:", error);
    res.status(500).json({ error: "Không thể tải file." });
  }
};

// thay đổi thứ tự step
exports.reorderSteps = async (req, res) => {
  try {
    const { menuId, orderedStepIds } = req.body;

    if (!menuId || !Array.isArray(orderedStepIds)) {
      return res
        .status(400)
        .json({ error: "menuId and orderedStepIds are required." });
    }

    const bulkOps = orderedStepIds.map((stepId, index) => ({
      updateOne: {
        filter: { _id: stepId, menu: menuId },
        update: { order: index },
      },
    }));

    await Step.bulkWrite(bulkOps);

    res.json({ message: "Steps reordered successfully" });
  } catch (err) {
    console.error("Reorder error:", err);
    res.status(500).json({ error: "Failed to reorder steps" });
  }
};
