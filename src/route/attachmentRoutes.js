const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const attachCtrl = require("../controllers/attachmentController");

router.get("/", attachCtrl.getAttachmentsByStep);
router.get("/:id", attachCtrl.getAttachmentById);
router.post("/", upload.single("file"), attachCtrl.createAttachment);
router.delete("/:id", attachCtrl.deleteAttachment);

module.exports = router;
