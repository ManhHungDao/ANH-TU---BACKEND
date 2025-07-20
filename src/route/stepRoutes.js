const express = require("express");
const multer = require("multer");
const stepController = require("../controllers/stepController");

const router = express.Router();
const storage = multer.memoryStorage(); // lưu file dưới dạng buffer
const upload = multer({ storage });

router.put("/reorder", stepController.reorderSteps);

router.get("/", stepController.getAllSteps);
router.get("/:id", stepController.getStepById);

// multipart/form-data (field: files[])
router.post("/", upload.array("files"), stepController.createStep);
router.put("/:id", upload.array("files"), stepController.updateStep);
router.get("/:id/attachments", stepController.getAttachments);
router.get(
  "/:stepId/attachments/:filename/download",
  upload.array("files"),
  stepController.downloadAttachment
);
router.put("/:id/title", stepController.updateStepTitle);
router.delete("/:id", stepController.deleteStep);
router.delete("/:stepId/attachments/:fileId", stepController.deleteAttachment);
module.exports = router;
// thay đổi nội dung content
router.put("/steps/:id", stepController.updateStepContent);
// add file to step
router.post(
  "/:id/attachments",
  upload.array("files"), // ✅ tên trùng với FormData
  stepController.addAttachmentToStep
);
router.get(
  "/:stepId/attachments/:attachmentId",
  stepController.getAttachmentFile
);
// thay đổi thứ tự
