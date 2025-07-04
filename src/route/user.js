import express from "express";
let router = express.Router();
const { isAuthunticatedUser, authorizeRole } = require("../middlewares/auth");

import {
  update,
  create,
  getAll,
  remove,
  getSingle,
  getAllHomePatient,
  getAllDoctorBySpecialtyHome,
  getAllDoctorByProvince,
  suggestDoctorRecent,
  outStandingDoctor,
  getAllManager,
  getAllDoctorBySpecialtyOfClinicHome,
} from "../controllers/user.js";

import {
  getAllCount,
  getAllMedicalHistory,
  getAllDoctorAccount,
  getAllPatientAccount,
  getAllLocationClinic,
  statisticTimeBooking,
} from "../controllers/dashboard";

import { getRoleUser, upsert } from "../controllers/role.js";

router.route("/create-user").post(isAuthunticatedUser, create);
router.route("/delete-user").delete(isAuthunticatedUser, remove);
router.route("/update-user").put(isAuthunticatedUser, update);
router.route("/get-user").get(getSingle);
router.route("/get-all-user").get(getAll);
router.route("/get-all-user-home").get(getAllHomePatient);
router.route("/get-user-by-specialty-home").get(getAllDoctorBySpecialtyHome);
router
  .route("/get-user-by-specialty-clinic-home")
  .get(getAllDoctorBySpecialtyOfClinicHome);

router.route("/get-user-by-province-home").get(getAllDoctorByProvince);
router.route("/suggest-doctor-recent").get(suggestDoctorRecent);
router.route("/get-outstading-doctor").get(outStandingDoctor);
router.route("/get-all-manager").get(isAuthunticatedUser, getAllManager);
// dashboard route
router.route("/get-all-count").get(isAuthunticatedUser, getAllCount);
router
  .route("/get-all-medical-history")
  .get(isAuthunticatedUser, getAllMedicalHistory);
router
  .route("/get-all-doctor-account")
  .get(isAuthunticatedUser, getAllDoctorAccount);
router
  .route("/get-all-patient-account")
  .get(isAuthunticatedUser, getAllPatientAccount);
router
  .route("/get-all-locaiton-clinic")
  .get(isAuthunticatedUser, getAllLocationClinic);

// router.route("/get-statistic-time").get(statisticTimeBooking);
router
  .route("/get-statistic-time")
  .get(isAuthunticatedUser, statisticTimeBooking);
router.route("/upsert-role-user").put(isAuthunticatedUser, upsert);
router.route("/get-role-user").get(isAuthunticatedUser, getRoleUser);

module.exports = router;
