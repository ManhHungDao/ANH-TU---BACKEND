const express = require("express");
const router = express.Router();
const typeController = require("../controllers/type");

import { getAllTypes, createType, deleteType } from "../controllers/type.js";

router.get("/types", getAllTypes);
router.post("/type/add", createType);
router.delete("/types/:id", deleteType);

module.exports = router;
