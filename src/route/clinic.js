import express from "express";
let router = express.Router();

import { getAll, getAllHomePatient, getSingle } from "../controllers/clinic.js";
router.route("/get-clinic").get(getSingle);
router.route("/get-all-clinic").get(getAll);
router.route("/get-all-clinic-home").get(getAllHomePatient);

module.exports = router;
