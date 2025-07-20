const Menu = require("../models/Menu");
const Step = require("../models/Step");

// GET ALL MENU
exports.getMenus = async (req, res) => {
  try {
    const filter = {};

    if (req.query.parent === "null") {
      filter.parent = null;
    } else if (req.query.parent) {
      filter.parent = req.query.parent;
    }

    const menus = await Menu.find(filter).sort("order");
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper: đệ quy lấy cây con
const buildMenuTree = async (menu) => {
  const steps = await Step.find({ menu: menu._id }).sort({ order: 1 });

  const children = await Menu.find({ parent: menu._id }).sort("order");

  const childTrees = await Promise.all(
    children.map(async (child) => await buildMenuTree(child))
  );

  return {
    ...menu.toObject(),
    steps,
    children: childTrees,
  };
};

// API: Lấy menu theo ID kèm toàn bộ menu con và steps
exports.getMenuWithChildrenById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: "Menu not found" });

    const fullTree = await buildMenuTree(menu);
    res.json(fullTree);
  } catch (err) {
    console.error("Lỗi getMenuWithChildrenById:", err);
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

exports.createMenu = async (req, res) => {
  try {
    const { title, parent } = req.body;

    // Kiểm tra trống
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Tên menu không được để trống." });
    }

    const cleanTitle = title.trim();

    // Kiểm tra ký tự đặc biệt
    const invalidCharRegex = /[^a-zA-Z0-9 _-]/;
    if (invalidCharRegex.test(cleanTitle)) {
      return res.status(400).json({
        error:
          "Tên menu không được chứa ký tự đặc biệt. Chỉ cho phép chữ, số, khoảng trắng, -, _",
      });
    }

    // Kiểm tra trùng tên trong cùng một parent
    const existing = await Menu.findOne({
      title: cleanTitle,
      parent: parent || null,
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Tên menu đã tồn tại trong cùng cấp." });
    }

    // Lấy order lớn nhất trong cùng parent
    const maxOrderMenu = await Menu.findOne({ parent: parent || null })
      .sort("-order")
      .select("order");

    const nextOrder = maxOrderMenu ? maxOrderMenu.order + 1 : 1;

    const newMenu = new Menu({
      title: cleanTitle,
      parent: parent || null,
      order: nextOrder,
    });

    await newMenu.save();
    res.status(201).json(newMenu);
  } catch (err) {
    console.error("Lỗi tạo menu:", err);
    res.status(400).json({ error: err.message });
  }
};

// UPDATE menu
// sửa tên
exports.updateMenuTitle = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Tên menu không được để trống." });
    }

    const cleanTitle = title.trim();

    // Kiểm tra ký tự đặc biệt
    const invalidCharRegex = /[^a-zA-Z0-9 _-]/;
    if (invalidCharRegex.test(cleanTitle)) {
      return res.status(400).json({
        error:
          "Tên menu không được chứa ký tự đặc biệt. Chỉ cho phép chữ, số, khoảng trắng, -, _",
      });
    }

    const menu = await Menu.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({ error: "Menu không tồn tại." });
    }

    // Kiểm tra trùng tên trong cùng parent
    const duplicate = await Menu.findOne({
      _id: { $ne: menu._id },
      title: cleanTitle,
      parent: menu.parent || null,
    });

    if (duplicate) {
      return res
        .status(400)
        .json({ error: "Tên menu đã tồn tại trong cùng cấp." });
    }

    menu.title = cleanTitle;
    await menu.save();

    res.json({ message: "Cập nhật thành công", menu });
  } catch (err) {
    console.error("Lỗi updateMenuTitle:", err);
    res.status(500).json({ error: err.message });
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
