const MenuItem = require("../models/MenuItem.js");
const Step = require("../models/Step");

// Build nested tree
const buildTree = (flatList) => {
  const idMap = {};
  const tree = [];

  flatList.forEach(
    (item) => (idMap[item._id] = { ...item._doc, children: [] })
  );

  flatList.forEach((item) => {
    if (item.parent) {
      idMap[item.parent]?.children.push(idMap[item._id]);
    } else {
      tree.push(idMap[item._id]);
    }
  });

  return tree;
};

exports.getMenuTree = async (req, res) => {
  const items = await MenuItem.find().sort({ order: 1 });
  res.json(buildTree(items));
};

exports.createMenuItem = async (req, res) => {
  const { name, parent } = req.body;
  const item = new MenuItem({ name, parent: parent || null });
  await item.save();

  // nếu có parent thì update children list
  if (parent) {
    await MenuItem.findByIdAndUpdate(parent, { $push: { children: item._id } });
  }

  res.status(201).json(item);
};

exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const item = await MenuItem.findByIdAndUpdate(id, { name }, { new: true });
  res.json(item);
};

exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;

  const deleteRecursive = async (menuId) => {
    const menu = await MenuItem.findById(menuId);
    if (!menu) return;
    for (const childId of menu.children) {
      await deleteRecursive(childId);
    }
    await Step.deleteMany({ _id: { $in: menu.steps } });
    await MenuItem.findByIdAndDelete(menuId);
  };

  await deleteRecursive(id);
  res.json({ success: true });
};

exports.getStepsByMenu = async (req, res) => {
  const { id } = req.params;
  const menu = await MenuItem.findById(id).populate("steps");
  res.json(menu.steps || []);
};

exports.attachStepToMenu = async (req, res) => {
  const { id } = req.params;
  const { stepId } = req.body;
  const updated = await MenuItem.findByIdAndUpdate(
    id,
    { $push: { steps: stepId } },
    { new: true }
  );
  res.json(updated);
};
