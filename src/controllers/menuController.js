const Menu = require("../models/Menu");

exports.getAllMenus = async (req, res) => {
  const menus = await Menu.find().sort({ createdAt: 1 });
  res.json(menus);
};

exports.getMenuById = async (req, res) => {
  const menu = await Menu.findById(req.params.id);
  res.json(menu);
};

exports.createMenu = async (req, res) => {
  const newMenu = new Menu(req.body);
  await newMenu.save();
  res.status(201).json(newMenu);
};

exports.updateMenu = async (req, res) => {
  const updated = await Menu.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
};

exports.deleteMenu = async (req, res) => {
  await Menu.findByIdAndDelete(req.params.id);
  res.status(204).send();
};
