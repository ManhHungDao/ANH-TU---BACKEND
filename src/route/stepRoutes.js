const express = require("express");
const router = express.Router();
const stepCtrl = require("../controllers/stepController");

router.get("/", stepCtrl.getStepsByInfoBoard);
router.get("/:id", stepCtrl.getStepById);
router.post("/", stepCtrl.createStep);
router.put("/:id", stepCtrl.updateStep);
router.delete("/:id", stepCtrl.deleteStep);

module.exports = router;
