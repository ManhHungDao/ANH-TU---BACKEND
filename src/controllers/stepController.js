const Step = require("../models/Step");

// Lấy tất cả các bước (có thể dùng lọc theo menu)
exports.getAllSteps = async (req, res) => {
  try {
    const filter = {};
    if (req.query.menu) {
      filter.menu = req.query.menu;
    }

    const steps = await Step.find(filter).sort({ order: 1 });
    res.json(steps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy chi tiết một bước
exports.getStepById = async (req, res) => {
  try {
    const step = await Step.findById(req.params.id);
    if (!step) return res.status(404).json({ message: "Step not found" });

    res.json(step);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo mới một bước
exports.createStep = async (req, res) => {
  try {
    const { menu, title, content, order, attachments } = req.body;

    const newStep = new Step({
      menu,
      title,
      content,
      order,
      attachments, // có thể là [] hoặc danh sách file dưới dạng { filename, mimetype, size, data (base64 hoặc buffer) }
    });

    await newStep.save();
    res.status(201).json(newStep);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Cập nhật một bước
exports.updateStep = async (req, res) => {
  try {
    const { title, content, order, attachments } = req.body;

    const updatedStep = await Step.findByIdAndUpdate(
      req.params.id,
      { title, content, order, attachments },
      { new: true }
    );

    if (!updatedStep)
      return res.status(404).json({ message: "Step not found" });

    res.json(updatedStep);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xoá một bước
exports.deleteStep = async (req, res) => {
  try {
    const step = await Step.findByIdAndDelete(req.params.id);
    if (!step) return res.status(404).json({ message: "Step not found" });

    res.json({ message: "Step deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
