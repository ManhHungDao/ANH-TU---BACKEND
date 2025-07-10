const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const file = require("./route/file");
const type = require("./route/type");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

require("dotenv").config();

const ErrorMiddleware = require("./middlewares/errors");

//setting up config file

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type"
  );
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

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

app.use("/api", file);
app.use("/api", type);

const upload = multer({ storage });
//Middleware error handler
app.use(ErrorMiddleware);

module.exports = app;
