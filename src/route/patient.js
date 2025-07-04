import express from "express";
let router = express.Router();
const { isAuthunticatedUser, authorizeRole } = require("../middlewares/auth");

import { sendMail } from "../controllers/mail";
import {
  create,
  getSingle,
  update,
  getAll,
  remove,
  updateFakeData,
  checkEmailExisted,
  chatAi,
  updatePrescriptions,
} from "../controllers/patient";

router.route("/sent-mail-confirm-register").post(sendMail);
router.route("/register").post(create);
router.route("/get-infor-account").get(isAuthunticatedUser, getSingle);
router.route("/update-infor-account").put(isAuthunticatedUser, update);
router.route("/get-all-account-patient").get(isAuthunticatedUser, getAll);
router.route("/delete-account-patient").delete(isAuthunticatedUser, remove);
router.route("/check-email-existed").get(checkEmailExisted);

// route update bulk data
router.route("/updateMany-fakedata-patient").get(updateFakeData);
router.route("/updateMany-prescription-patient").get(updatePrescriptions);
//
router.route("/chat-ai").get(chatAi);

module.exports = router;
