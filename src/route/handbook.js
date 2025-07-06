import express from "express";
let router = express.Router();

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

router.route("/create-handbook").post(create);
router.route("/get-all-handbook").get(getAll);
router.route("/get-single-handbook").get(getSingle);
router.route("/delete-handbook").delete(remove);
router.route("/update-handbook").put(update);
router.route("/get-all-home-handbook").get(getAllHomePatient);
router.route("/get-related-handbook").get(getRelated);
router.route("/get-all-specialty-handbook").get(getAllSpecialty);

module.exports = router;
