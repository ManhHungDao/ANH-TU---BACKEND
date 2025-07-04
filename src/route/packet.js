import express from "express";
let router = express.Router();
const { isAuthunticatedUser, authorizeRole } = require("../middlewares/auth");

import {
  create,
  getAll,
  getSingle,
  remove,
  update,
} from "../controllers/packet";

router.route("/create-packet").post(isAuthunticatedUser, create);
router.route("/get-packet").get(getSingle);
router.route("/delete-packet").delete(isAuthunticatedUser, remove);
router.route("/get-all-packet").get(getAll);
router.route("/update-packet").put(isAuthunticatedUser, update);

module.exports = router;
