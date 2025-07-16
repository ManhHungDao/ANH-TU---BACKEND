// controllers/menuController.js
const Menu = require("../models/Menu");
const fs = require("fs");
const path = require("path");

// Helper function for error handling
const handleError = (res, error, message = "Something went wrong") => {
  console.error(error);
  return res.status(500).json({ success: false, error: message });
};

// ======== MENU (LEVEL 1) ========
const getAllMenus = async (req, res) => {
  try {
    const menus = await Menu.find({});
    res.json({ success: true, data: menus });
  } catch (error) {
    handleError(res, error, "Failed to fetch menus");
  }
};

const createMenu = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, error: "Name is required" });

    const newMenu = new Menu({ name });
    await newMenu.save();
    res.status(201).json({ success: true, data: newMenu });
  } catch (error) {
    handleError(res, error, "Failed to create menu");
  }
};

const getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu)
      return res.status(404).json({ success: false, error: "Menu not found" });
    res.json({ success: true, data: menu });
  } catch (error) {
    handleError(res, error, "Failed to fetch menu");
  }
};

const updateMenu = async (req, res) => {
  try {
    const updatedMenu = await Menu.findByIdAndUpdate(
      req.params.menuId,
      { name: req.body.name },
      { new: true }
    );
    if (!updatedMenu)
      return res.status(404).json({ success: false, error: "Menu not found" });
    res.json({ success: true, data: updatedMenu });
  } catch (error) {
    handleError(res, error, "Failed to update menu");
  }
};

const deleteMenu = async (req, res) => {
  try {
    const deletedMenu = await Menu.findByIdAndDelete(req.params.menuId);
    if (!deletedMenu)
      return res.status(404).json({ success: false, error: "Menu not found" });
    res.json({ success: true, message: "Menu deleted successfully" });
  } catch (error) {
    handleError(res, error, "Failed to delete menu");
  }
};

// ======== LEVEL 2 ========
const addLevel2 = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu)
      return res.status(404).json({ success: false, error: "Menu not found" });

    const { name } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, error: "Name is required" });

    menu.children.push({ name });
    await menu.save();
    res
      .status(201)
      .json({ success: true, data: menu.children[menu.children.length - 1] });
  } catch (error) {
    handleError(res, error, "Failed to add level 2");
  }
};

const updateLevel2 = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu)
      return res.status(404).json({ success: false, error: "Menu not found" });

    const level2 = menu.children.id(req.params.level2Id);
    if (!level2)
      return res
        .status(404)
        .json({ success: false, error: "Level 2 not found" });

    level2.name = req.body.name;
    await menu.save();
    res.json({ success: true, data: level2 });
  } catch (error) {
    handleError(res, error, "Failed to update level 2");
  }
};

const deleteLevel2 = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu)
      return res.status(404).json({ success: false, error: "Menu not found" });

    const level2 = menu.children.id(req.params.level2Id);
    if (!level2)
      return res
        .status(404)
        .json({ success: false, error: "Level 2 not found" });

    level2.remove();
    await menu.save();
    res.json({ success: true, message: "Level 2 deleted successfully" });
  } catch (error) {
    handleError(res, error, "Failed to delete level 2");
  }
};

// ======== LEVEL 3 ========
const addLevel3 = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu)
      return res.status(404).json({ success: false, error: "Menu not found" });

    const level2 = menu.children.id(req.params.level2Id);
    if (!level2)
      return res
        .status(404)
        .json({ success: false, error: "Level 2 not found" });

    const { name } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, error: "Name is required" });

    level2.children.push({ name });
    await menu.save();
    res.status(201).json({
      success: true,
      data: level2.children[level2.children.length - 1],
    });
  } catch (error) {
    handleError(res, error, "Failed to add level 3");
  }
};

// ... (Tương tự cho updateLevel3 và deleteLevel3)

// ======== STEPS ========
const addStep = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title)
      return res
        .status(400)
        .json({ success: false, error: "Title is required" });

    const step = { title, content: content || "" };

    // Xác định vị trí thêm step (level1, level2 hay level3)
    if (req.params.level3Id) {
      const menu = await Menu.findById(req.params.menuId);
      const level2 = menu.children.id(req.params.level2Id);
      const level3 = level2.children.id(req.params.level3Id);
      level3.steps.push(step);
      await menu.save();
      return res
        .status(201)
        .json({ success: true, data: level3.steps[level3.steps.length - 1] });
    }
    // ... (Xử lý tương tự cho level2 và level1)
  } catch (error) {
    handleError(res, error, "Failed to add step");
  }
};

// ======== FILE UPLOAD ========
const uploadFiles = async (req, res) => {
  try {
    const step = await findStepInHierarchy(req.params.stepId); // Hàm tự viết để tìm step trong cấu trúc menu
    if (!step)
      return res.status(404).json({ success: false, error: "Step not found" });

    const files = req.files.map((file) => ({
      name: file.originalname,
      path: file.path,
      size: file.size,
      type: file.mimetype,
    }));

    step.files = [...(step.files || []), ...files];
    await step.save();
    res.status(201).json({ success: true, data: files });
  } catch (error) {
    req.files?.forEach((file) => fs.unlinkSync(file.path)); // Xóa file nếu có lỗi
    handleError(res, error, "Failed to upload files");
  }
};

// ======== LEVEL 3 ========
const updateLevel3 = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu)
      return res.status(404).json({ success: false, error: "Menu not found" });

    const level2 = menu.children.id(req.params.level2Id);
    if (!level2)
      return res
        .status(404)
        .json({ success: false, error: "Level 2 not found" });

    const level3 = level2.children.id(req.params.level3Id);
    if (!level3)
      return res
        .status(404)
        .json({ success: false, error: "Level 3 not found" });

    level3.name = req.body.name;
    await menu.save();
    res.json({ success: true, data: level3 });
  } catch (error) {
    handleError(res, error, "Failed to update level 3");
  }
};

const deleteLevel3 = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu)
      return res.status(404).json({ success: false, error: "Menu not found" });

    const level2 = menu.children.id(req.params.level2Id);
    if (!level2)
      return res
        .status(404)
        .json({ success: false, error: "Level 2 not found" });

    const level3 = level2.children.id(req.params.level3Id);
    if (!level3)
      return res
        .status(404)
        .json({ success: false, error: "Level 3 not found" });

    level3.remove();
    await menu.save();
    res.json({ success: true, message: "Level 3 deleted successfully" });
  } catch (error) {
    handleError(res, error, "Failed to delete level 3");
  }
};

// ======== STEPS ========
const updateStep = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title)
      return res
        .status(400)
        .json({ success: false, error: "Title is required" });

    const step = await findStepInHierarchy(req.params.stepId);
    if (!step)
      return res.status(404).json({ success: false, error: "Step not found" });

    step.title = title;
    step.content = content || "";
    await step.save();
    res.json({ success: true, data: step });
  } catch (error) {
    handleError(res, error, "Failed to update step");
  }
};

// Utility function to find step in hierarchy
const findStepInHierarchy = async (stepId) => {
  const menu = await Menu.findOne({ "children.children.steps._id": stepId });
  if (!menu) return null;

  for (const level2 of menu.children) {
    for (const level3 of level2.children) {
      const step = level3.steps.id(stepId);
      if (step) return step;
    }
  }
  return null;
};
const deleteFile = async (req, res) => {
  try {
    const step = await findStepInHierarchy(req.params.stepId);
    if (!step)
      return res.status(404).json({ success: false, error: "Step not found" });

    const fileId = req.params.fileId;
    const fileIndex = step.files.findIndex(
      (file) => file._id.toString() === fileId
    );

    if (fileIndex === -1) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    // Xóa file từ hệ thống
    const filePath = step.files[fileIndex].path;
    fs.unlinkSync(filePath); // Xóa file trên hệ thống

    // Xóa file khỏi danh sách trong step
    step.files.splice(fileIndex, 1);
    await step.save();

    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    handleError(res, error, "Failed to delete file");
  }
};

const deleteStep = async (req, res) => {
  try {
    const step = await findStepInHierarchy(req.params.stepId);
    if (!step)
      return res.status(404).json({ success: false, error: "Step not found" });

    // Xóa file từ hệ thống nếu cần
    if (step.files) {
      step.files.forEach((file) => fs.unlinkSync(file.path)); // Xóa tất cả file liên quan
    }

    // Xóa step khỏi cấu trúc menu
    const menu = await Menu.findOne({
      "children.children.steps._id": req.params.stepId,
    });
    if (!menu)
      return res.status(404).json({ success: false, error: "Menu not found" });

    for (const level2 of menu.children) {
      for (const level3 of level2.children) {
        const stepIndex = level3.steps.findIndex(
          (s) => s._id.toString() === req.params.stepId
        );
        if (stepIndex !== -1) {
          level3.steps.splice(stepIndex, 1); // Xóa step khỏi level3
          await menu.save();
          return res.json({
            success: true,
            message: "Step deleted successfully",
          });
        }
      }
    }

    return res
      .status(404)
      .json({ success: false, error: "Step not found in menu structure" });
  } catch (error) {
    handleError(res, error, "Failed to delete step");
  }
};

module.exports = {
  getAllMenus,
  createMenu,
  getMenuById,
  updateMenu,
  deleteMenu,
  addLevel2,
  updateLevel2,
  deleteLevel2,
  addLevel3,
  updateLevel3,
  deleteLevel3,
  addStep,
  updateStep,
  uploadFiles,
  deleteFile,
  findStepInHierarchy,
  deleteStep,
};
