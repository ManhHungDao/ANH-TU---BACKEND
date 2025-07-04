import express from "express";
let router = express.Router();
const { isAuthunticatedUser, authorizeRole } = require("../middlewares/auth");

import {
  create,
  getAll,
  remove,
  getSingle,
  update,
  getAllAssistantUnderDoctor,
} from "../controllers/assistant";

router.route("/create-new-assistant").post(isAuthunticatedUser, create);
router.route("/get-all-assistant").get(isAuthunticatedUser, getAll);
router.route("/remove-assistant").delete(isAuthunticatedUser, remove);
router.route("/get-single-assistant").get(getSingle);
router.route("/update-assistant").put(isAuthunticatedUser, update);
router
  .route("/get-assistant-under-doctor")
  .get(isAuthunticatedUser, getAllAssistantUnderDoctor);
module.exports = router;
