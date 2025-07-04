import express from "express";
let router = express.Router();
const { isAuthunticatedUser, authorizeRole } = require("../middlewares/auth");

import {
  upsert,
  getSingle,
  getListResultRecent,
} from "../controllers/prescription";

router.route("/create-prescription").post(isAuthunticatedUser, upsert);
router.route("/get-single-prescription").get(isAuthunticatedUser, getSingle);
router
  .route("/get-list-result-recent")
  .get(isAuthunticatedUser, getListResultRecent);

module.exports = router;
