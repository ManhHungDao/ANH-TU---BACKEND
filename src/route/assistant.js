import express from "express";
let router = express.Router();

import {
  create,
  getAll,
  remove,
  getSingle,
  update,
  getAllAssistantUnderDoctor,
} from "../controllers/assistant";

router.route("/create-new-assistant").post(create);
router.route("/get-all-assistant").get(getAll);
router.route("/remove-assistant").delete(remove);
router.route("/get-single-assistant").get(getSingle);
router.route("/update-assistant").put(update);
router.route("/get-assistant-under-doctor").get(getAllAssistantUnderDoctor);
module.exports = router;
