const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Connect to MongoDB: done in server.js via connectDatabase()

// Middlewares
const allowedOrigin = (
  process.env.FRONTEND_URL || "http://localhost:3000"
).replace(/\/$/, "");

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Upload directory setup
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Static file serving
app.use("/uploads", express.static(UPLOAD_DIR));

// Route imports
const menuRoutes = require("./route/menuRoutes");
const stepRoutes = require("./route/stepRoutes");

// Use routes
app.use("/api/menu-items", menuRoutes);
app.use("/api/steps", stepRoutes);

// Error handling middleware
const ErrorMiddleware = require("./middlewares/errors");
app.use(ErrorMiddleware);

module.exports = app;
