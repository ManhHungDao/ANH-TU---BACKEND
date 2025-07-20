const express = require("express");
const multer = require("multer");
const stepController = require("../controllers/stepController");

const router = express.Router();
const upload = multer(); // lưu vào memory (RAM)

router.get("/", stepController.getAllSteps);
router.get("/:id", stepController.getStepById);

// multipart/form-data (field: files[])
router.post("/", upload.array("files"), stepController.createStep);
router.put("/:id", upload.array("files"), stepController.updateStep);

router.delete("/:id", stepController.deleteStep);

module.exports = router;
