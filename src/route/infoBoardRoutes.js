const express = require("express");
const router = express.Router();
const boardCtrl = require("../controllers/infoBoardController");

router.get("/", boardCtrl.getAllInfoBoards);
router.get("/:id", boardCtrl.getInfoBoardById);
router.post("/", boardCtrl.createInfoBoard);
router.put("/:id", boardCtrl.updateInfoBoard);
router.delete("/:id", boardCtrl.deleteInfoBoard);

module.exports = router;
