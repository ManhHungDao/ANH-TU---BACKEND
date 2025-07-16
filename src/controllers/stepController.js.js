const Step = require("../models/Step");

exports.getAllSteps = async (req, res) => {
  const steps = await Step.find();
  res.json(steps);
};

exports.getStepById = async (req, res) => {
  const step = await Step.findById(req.params.id);
  res.json(step);
};

exports.createStep = async (req, res) => {
  const step = new Step(req.body);
  await step.save();
  res.status(201).json(step);
};

exports.updateStep = async (req, res) => {
  const updated = await Step.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
};

exports.deleteStep = async (req, res) => {
  await Step.findByIdAndDelete(req.params.id);
  res.status(204).send();
};

exports.uploadFileToStep = async (req, res) => {
  const stepId = req.params.id;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const fileData = {
    name: file.originalname,
    url: `/uploads/${file.filename}`,
    size: file.size,
    type: file.mimetype,
    uploadedAt: new Date(),
  };

  const updatedStep = await Step.findByIdAndUpdate(
    stepId,
    { $push: { attachments: fileData } },
    { new: true }
  );

  res.status(200).json({ success: true, file: fileData, step: updatedStep });
};
