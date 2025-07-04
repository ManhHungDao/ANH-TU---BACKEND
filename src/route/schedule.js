import express from "express";
let router = express.Router();
const { isAuthunticatedUser, authorizeRole } = require("../middlewares/auth");

import {
  createOrUpdate,
  getSingleUser,
  remove,
  getUserScheduleByDate,
  updateStatus,
  getPacketScheduleByDate,
  getSinglePacket,
  createUserBooking,
  patientUpdateStatus,
  patientUpdateFeeback,
  patientCheckAllowUpdateFeeback,
  gellAllByEmail,
  getDetail,
  getPatientByDoctor,
  getPatientByPacket,
  createAllSchedule,
} from "../controllers/schedule";
import { sendMail } from "../controllers/mail";

router.route("/upsert-schedule").post(isAuthunticatedUser, createOrUpdate);
router.route("/update-status-schedule").put(isAuthunticatedUser, updateStatus);
router.route("/get-single-user-schedule").get(getSingleUser);
router.route("/get-single-packet-schedule").get(getSinglePacket);
router.route("/get-user-schedule").get(getUserScheduleByDate);
router.route("/get-packet-schedule").get(getPacketScheduleByDate);
router.route("/delete-schedule").delete(isAuthunticatedUser, remove);
router.route("/sent-mail-patient").post(isAuthunticatedUser, sendMail);
router.route("/create-user-booking-schedule").put(createUserBooking);
router.route("/patient-confirm-booking").put(patientUpdateStatus);
router.route("/patient-feedback").put(patientUpdateFeeback);
router.route("/check-patient-feedback").get(patientCheckAllowUpdateFeeback);
router.route("/get-schedule-by-email").get(isAuthunticatedUser, gellAllByEmail);
router.route("/get-detail-schedule").get(isAuthunticatedUser, getDetail);
router.route("/get-patient-comment-by-doctor").get(getPatientByDoctor);
router.route("/get-patient-comment-by-packet").get(getPatientByPacket);

//  dùng để tạo tất cả lịch khám cho bác sĩ và các gói khám
router.route("/create-all-schedule").get(createAllSchedule);

module.exports = router;
