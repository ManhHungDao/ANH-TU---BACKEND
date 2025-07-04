import express from "express";
let router = express.Router();
const { isAuthunticatedUser, authorizeRole } = require("../middlewares/auth");


import {
  update,
  create,
  getAll,
  remove,
  getSingle,
  getByClinicId,
  getPopularHome,
} from "../controllers/specialty";

router.route("/create-specialty").post(isAuthunticatedUser,create);
router.route("/delete-specialty").delete(isAuthunticatedUser,remove);
router.route("/update-specialty").put(isAuthunticatedUser,update);
router.route("/get-specialty").get(getSingle);
router.route("/get-all-specialty").get(getAll);
router.route("/get-by-clinic").get(getByClinicId);
router.route("/get-popular-spacialty-home").get(getPopularHome);

module.exports = router;
