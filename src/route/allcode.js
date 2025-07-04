import express from "express";
let router = express.Router();
const { isAuthunticatedUser, authorizeRole } = require("../middlewares/auth");

import {
  getByType,
  getAll,
  remove,
  update,
  create,
  getTypePagination,
} from "../controllers/allcode";

router.route("/get-all-allcode").get(getAll);
router.route("/create-allcode").post(isAuthunticatedUser, create);
router.route("/delete-allcode").delete(isAuthunticatedUser, remove);
router.route("/update-allcode").put(isAuthunticatedUser, update);
router.route("/get-allcode-pagination").get(getTypePagination);

module.exports = router;
