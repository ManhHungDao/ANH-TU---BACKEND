const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
let router = express.Router();

import {
  uploadFiles,
  getDetailFile,
  updateFile,
  deleteFile,
  downloadFile,
  getAll,
} from "../controllers/file.js";

// Setup Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage: storage });

router
  .route("/files/upload-multiple")
  .post(upload.array("files", 10), uploadFiles);
router.route("/files").get(getAll);
router.route("/file/:id").get(getDetailFile);
router.route("/files/:id").delete(deleteFile);

// router.route("/files/:id").put(updateFile);
// router.route("/files/download/:id").get(downloadFile);

module.exports = router;
