import express from "express";
let router = express.Router();

import {
  getByType,
  getAll,
  remove,
  update,
  create,
  getTypePagination,
} from "../controllers/allcode";

router.route("/get-all-allcode").get(getAll);
router.route("/create-allcode").post(create);
router.route("/delete-allcode").delete(remove);
router.route("/update-allcode").put(update);
router.route("/get-allcode-pagination").get(getTypePagination);

module.exports = router;
