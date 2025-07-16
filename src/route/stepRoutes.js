const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const stepController = require("../controllers/stepController.js");

// Multer setup
const UPLOAD_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.get("/", stepController.getAllSteps);
router.get("/:id", stepController.getStepById);
router.post("/", stepController.createStep);
router.put("/:id", stepController.updateStep);
router.delete("/:id", stepController.deleteStep);
router.post(
  "/:id/upload",
  upload.single("file"),
  stepController.uploadFileToStep
);
module.exports = router;
