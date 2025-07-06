const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

// route
const assistant = require("./route/assistant");
const specialty = require("./route/specialty");
const handbook = require("./route/handbook");
const packet = require("./route/packet");
const user = require("./route/user");
const clinic = require("./route/clinic");
const allcode = require("./route/allcode");
const schedule = require("./route/schedule");
const patient = require("./route/patient");
const prescription = require("./route/prescription");
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
app.use(fileUpload());

//import all routes

app.use("/api", user);
app.use("/api", clinic);
app.use("/api", allcode);
app.use("/api", specialty);
app.use("/api", handbook);
app.use("/api", schedule);
app.use("/api", packet);
app.use("/api", patient);
app.use("/api", prescription);
app.use("/api", assistant);

//Middleware error handler
app.use(ErrorMiddleware);

module.exports = app;
