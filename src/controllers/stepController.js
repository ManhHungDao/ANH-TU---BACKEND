const Step = require("../models/Step");
const mongoose = require("mongoose");

// Tạo mới step với file đính kèm (upload)
exports.createStep = async (req, res) => {
  try {
    const { menu, title, content, order } = req.body;

    const attachments = (req.files || []).map((file) => ({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      data: file.buffer,
    }));

    const newStep = new Step({
      menu: new mongoose.Types.ObjectId(menu),
      title,
      content,
      order,
      attachments,
    });

    await newStep.save();
    res.status(201).json(newStep);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
