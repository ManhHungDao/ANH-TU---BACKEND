const InfoBoard = require("../models/InfoBoard");

exports.getAllInfoBoards = async (req, res) => {
  const infoBoards = await InfoBoard.find().populate("menu");
  res.json(infoBoards);
};

exports.getInfoBoardById = async (req, res) => {
  const infoBoard = await InfoBoard.findById(req.params.id).populate("menu");
  res.json(infoBoard);
};

exports.createInfoBoard = async (req, res) => {
  const newBoard = new InfoBoard(req.body);
  await newBoard.save();
  res.status(201).json(newBoard);
};

exports.updateInfoBoard = async (req, res) => {
  const updated = await InfoBoard.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
};

exports.deleteInfoBoard = async (req, res) => {
  await InfoBoard.findByIdAndDelete(req.params.id);
  res.status(204).send();
};
