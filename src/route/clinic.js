import express from "express";
let router = express.Router();
const { isAuthunticatedUser, authorizeRole } = require("../middlewares/auth");

import {
  update,
  create,
  getAll,
  getAllHomePatient,
  remove,
  getSingle,
  increatmentViews,
  getAllProvince,
  suggestNearestClinic,
} from "../controllers/clinic.js";
router.route("/create-clinic").post(isAuthunticatedUser, create);
router.route("/delete-clinic").delete(isAuthunticatedUser, remove);
router.route("/update-clinic").put(isAuthunticatedUser, update);
router.route("/get-clinic").get(getSingle);
router.route("/get-all-clinic").get(isAuthunticatedUser, getAll);
router.route("/get-all-clinic-home").get(getAllHomePatient);
router.route("/suggest-nearest-clinic-home").get(suggestNearestClinic);
router.route("/increment-view-count").post(increatmentViews);
router.route("/get-all-privince-clinic").get(getAllProvince);

module.exports = router;
