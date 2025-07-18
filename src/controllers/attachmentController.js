const Attachment = require("../models/Attachment");

exports.getAttachmentsByStep = async (req, res) => {
  const attachments = await Attachment.find({ step: req.query.step });
  res.json(attachments);
};

exports.getAttachmentById = async (req, res) => {
  const attachment = await Attachment.findById(req.params.id);
  res.json(attachment);
};

exports.createAttachment = async (req, res) => {
  const file = req.file;
  const attachment = new Attachment({
    step: req.body.step,
    filename: file.originalname,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
  });
  await attachment.save();
  res.status(201).json(attachment);
};

exports.deleteAttachment = async (req, res) => {
  await Attachment.findByIdAndDelete(req.params.id);
  res.status(204).send();
};
