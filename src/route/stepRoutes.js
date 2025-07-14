const express = require("express");
const router = express.Router();
const stepController = require("../controllers/stepController.js");

router.get("/", stepController.getAllSteps);
router.get("/:id", stepController.getStepById);
router.post("/", stepController.createStep);
router.put("/:id", stepController.updateStep);
router.delete("/:id", stepController.deleteStep);

module.exports = router;
