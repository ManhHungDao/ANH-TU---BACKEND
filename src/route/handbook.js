import express from "express";
let router = express.Router();
const { isAuthunticatedUser, authorizeRole } = require("../middlewares/auth");

import {
  create,
  getAll,
  getSingle,
  remove,
  update,
  getAllHomePatient,
  getRelated,
  getAllSpecialty,
} from "../controllers/handbook";

router.route("/create-handbook").post(isAuthunticatedUser, create);
router.route("/get-all-handbook").get(isAuthunticatedUser, getAll);
router.route("/get-single-handbook").get(getSingle);
router.route("/delete-handbook").delete(isAuthunticatedUser, remove);
router.route("/update-handbook").put(isAuthunticatedUser, update);
router.route("/get-all-home-handbook").get(getAllHomePatient);
router.route("/get-related-handbook").get(getRelated);
router.route("/get-all-specialty-handbook").get(getAllSpecialty);

module.exports = router;
