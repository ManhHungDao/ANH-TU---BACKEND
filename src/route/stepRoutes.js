const express = require("express");
const router = express.Router();
const step = require("../controllers/stepController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/", step.createStep);
router.put("/:id", step.updateStep);
router.delete("/:id", step.deleteStep);
router.post("/:id/attachments", upload.array("files"), step.uploadAttachments);
router.delete("/:id/attachments/:fileName", step.deleteAttachment);

module.exports = router;
