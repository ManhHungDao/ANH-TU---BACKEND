const Step = require("../models/Step");

exports.createStep = async (req, res) => {
  const { title } = req.body;
  const step = new Step({ title });
  await step.save();
  res.status(201).json(step);
};

exports.updateStep = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const updated = await Step.findByIdAndUpdate(
    id,
    { title, content },
    { new: true }
  );
  res.json(updated);
};

exports.deleteStep = async (req, res) => {
  const { id } = req.params;
  await Step.findByIdAndDelete(id);
  res.json({ success: true });
};

exports.uploadAttachments = async (req, res) => {
  const { id } = req.params;
  const files = req.files.map((file) => ({
    name: file.originalname,
    url: `/uploads/${file.filename}`,
    size: file.size,
    type: file.mimetype,
  }));

  const step = await Step.findByIdAndUpdate(
    id,
    { $push: { attachments: { $each: files } } },
    { new: true }
  );
  res.json(step);
};

exports.deleteAttachment = async (req, res) => {
  const { id, fileName } = req.params;
  const step = await Step.findByIdAndUpdate(
    id,
    {
      $pull: { attachments: { name: fileName } },
    },
    { new: true }
  );
  res.json(step);
};
