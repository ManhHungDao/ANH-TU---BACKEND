import express from "express";
let router = express.Router();

import {
  upsert,
  getSingle,
  getListResultRecent,
} from "../controllers/prescription";

router.route("/create-prescription").post(upsert);
router.route("/get-single-prescription").get(getSingle);
router.route("/get-list-result-recent").get(getListResultRecent);

module.exports = router;
