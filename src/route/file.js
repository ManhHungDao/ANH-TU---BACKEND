import express from "express";
let router = express.Router();

import {
  createFile,
  uploadFile,
  getDetailFile,
  updateFile,
  deleteFile,
  downloadFile,
} from "../controllers/file.js";
router.route("/api/files").get(createFile);
router.route("/api/files/upload").post(uploadFile);
router.route("/api/files/:id").get(getDetailFile);
router.route("/api/files/:id").put(updateFile);
router.route("/api/files/:id").delete(deleteFile);
router.route("/api/files/download/:id").get(downloadFile);

module.exports = router;
