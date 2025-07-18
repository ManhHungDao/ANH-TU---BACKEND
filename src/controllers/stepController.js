const Step = require("../models/Step");

exports.getStepsByInfoBoard = async (req, res) => {
  const steps = await Step.find({ infoBoard: req.query.infoBoard }).sort({
    order: 1,
  });
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
