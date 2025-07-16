const express = require("express");
const router = express.Router();
const menu = require("../controllers/menuController.js");

router.get("/tree", menu.getMenuTree);
router.post("/", menu.createMenuItem);
router.put("/:id", menu.updateMenuItem);
router.delete("/:id", menu.deleteMenuItem);

router.get("/:id/steps", menu.getStepsByMenu);
router.post("/:id/steps", menu.attachStepToMenu);

module.exports = router;
