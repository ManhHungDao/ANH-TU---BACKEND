const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");

router.get("/", menuController.getMenus);
router.get("/:id", menuController.getMenuById);
router.get("/full-tree/:id", menuController.getMenuWithChildrenById);
router.post("/", menuController.createMenu);
router.put("/:id/title", menuController.updateMenuTitle);
router.delete("/:id", menuController.deleteMenu);

// step api

module.exports = router;
