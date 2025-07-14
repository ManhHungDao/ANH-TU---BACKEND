const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const menuRoutes = require("./route/menuRoutes");
const stepRoutes = require("./route/stepRoutes");

require("dotenv").config();

const ErrorMiddleware = require("./middlewares/errors");

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(cookieParser());

const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Cấu hình Multer cho nhiều file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, file.originalname),
});

app.use("/api/menus", menuRoutes);
app.use("/api/steps", stepRoutes);

const upload = multer({ storage });
//Middleware error handler
app.use(ErrorMiddleware);

module.exports = app;
