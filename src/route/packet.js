import express from "express";
let router = express.Router();

import {
  create,
  getAll,
  getSingle,
  remove,
  update,
} from "../controllers/packet";

router.route("/create-packet").post(create);
router.route("/get-packet").get(getSingle);
router.route("/delete-packet").delete(remove);
router.route("/get-all-packet").get(getAll);
router.route("/update-packet").put(update);

module.exports = router;
