const Menu = require("../models/Menu");
const Step = require("../models/Step");

// GET all menus (optionally nested tree + steps)
exports.getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.find().sort({ order: 1 });

    const menuWithSteps = await Promise.all(
      menus.map(async (menu) => {
        const steps = await Step.find({ menu: menu._id }).sort({ order: 1 });
        return { ...menu.toObject(), steps };
      })
    );

    res.json(menuWithSteps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET a single menu by ID + steps
exports.getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: "Menu not found" });

    const steps = await Step.find({ menu: menu._id }).sort({ order: 1 });

    res.json({ ...menu.toObject(), steps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE new menu
exports.createMenu = async (req, res) => {
  try {
    const { title, parent, order } = req.body;
    const newMenu = new Menu({ title, parent: parent || null, order });
    await newMenu.save();
    res.status(201).json(newMenu);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE menu
exports.updateMenu = async (req, res) => {
  try {
    const { title, parent, order } = req.body;
    const updatedMenu = await Menu.findByIdAndUpdate(
      req.params.id,
      { title, parent: parent || null, order },
      { new: true }
    );
    if (!updatedMenu)
      return res.status(404).json({ message: "Menu not found" });

    res.json(updatedMenu);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE menu (and optionally its submenus/steps)
exports.deleteMenu = async (req, res) => {
  try {
    const menuId = req.params.id;

    // Xoá tất cả step liên quan
    await Step.deleteMany({ menu: menuId });

    // Xoá menu con đệ quy nếu cần (hoặc tuỳ yêu cầu)
    await Menu.deleteOne({ _id: menuId });

    res.json({ message: "Menu deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
