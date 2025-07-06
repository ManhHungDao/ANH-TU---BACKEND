import express from "express";
let router = express.Router();

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

router.route("/create-user").post(create);
router.route("/delete-user").delete(remove);
router.route("/update-user").put(update);
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
router.route("/get-all-manager").get(getAllManager);
// dashboard route
router.route("/get-all-count").get(getAllCount);
router.route("/get-all-medical-history").get(getAllMedicalHistory);
router.route("/get-all-doctor-account").get(getAllDoctorAccount);
router.route("/get-all-patient-account").get(getAllPatientAccount);
router.route("/get-all-locaiton-clinic").get(getAllLocationClinic);

// router.route("/get-statistic-time").get(statisticTimeBooking);
router.route("/get-statistic-time").get(statisticTimeBooking);
router.route("/upsert-role-user").put(upsert);
router.route("/get-role-user").get(getRoleUser);

module.exports = router;
