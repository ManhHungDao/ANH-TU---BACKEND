// routes/menuRoutes.js - Router chính
const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const upload = require("../utils/fileUpload");

// ------ API Menu (Level 1) ------
router.get("/", menuController.getAllMenus);
router.post("/", menuController.createMenu);
router.get("/:menuId", menuController.getMenuById);
router.put("/:menuId", menuController.updateMenu);
router.delete("/:menuId", menuController.deleteMenu);

// ------ API Level 2 ------
router.post("/:menuId/level2", menuController.addLevel2);
router.put("/:menuId/level2/:level2Id", menuController.updateLevel2);
router.delete("/:menuId/level2/:level2Id", menuController.deleteLevel2);

// ------ API Level 3 ------
router.post("/:menuId/level2/:level2Id/level3", menuController.addLevel3);
router.put(
  "/:menuId/level2/:level2Id/level3/:level3Id",
  menuController.updateLevel3
);
router.delete(
  "/:menuId/level2/:level2Id/level3/:level3Id",
  menuController.deleteLevel3
);

// ------ API Steps & Files ------
router.post("/:menuId/steps", menuController.addStep); // Thêm step cho level1
router.post("/:menuId/level2/:level2Id/steps", menuController.addStep); // Thêm step cho level2
router.post(
  "/:menuId/level2/:level2Id/level3/:level3Id/steps",
  menuController.addStep
); // Thêm step cho level3
router.put("/steps/:stepId", menuController.updateStep);
router.delete("/steps/:stepId", menuController.deleteStep);

// File upload (dùng cho cả step của mọi cấp)
router.post(
  "/steps/:stepId/files",
  upload.array("files", 5),
  menuController.uploadFiles
);
router.delete("/steps/:stepId/files/:fileId", menuController.deleteFile);

module.exports = router;
