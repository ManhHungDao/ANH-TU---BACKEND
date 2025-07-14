const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController.js");

router.get("/", menuController.getAllMenus);
router.get("/:id", menuController.getMenuById);
router.post("/", menuController.createMenu);
router.put("/:id", menuController.updateMenu);
router.delete("/:id", menuController.deleteMenu);
router.get("/:id/steps", menuController.getStepsByMenuId);

module.exports = router;
