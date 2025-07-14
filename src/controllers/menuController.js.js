const MenuItem = require("../models/MenuItem.js");
const Step = require("../models/Step");

exports.getAllMenus = async (req, res) => {
  const menus = await MenuItem.find({ parent: null }).populate({
    path: "children",
    populate: {
      path: "children",
      populate: "steps",
    },
  });
  res.json(menus);
};

exports.getMenuById = async (req, res) => {
  const menu = await MenuItem.findById(req.params.id).populate(
    "steps children"
  );
  res.json(menu);
};

exports.createMenu = async (req, res) => {
  const menu = new MenuItem(req.body);
  await menu.save();
  res.status(201).json(menu);
};

exports.updateMenu = async (req, res) => {
  const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
};

exports.deleteMenu = async (req, res) => {
  await MenuItem.findByIdAndDelete(req.params.id);
  res.status(204).send();
};

exports.getStepsByMenuId = async (req, res) => {
  const menu = await MenuItem.findById(req.params.id).populate("steps");
  res.json(menu?.steps || []);
};
