const express = require("express");
const router = express.Router();
const { getArticlesCtrl } = require("../controller/articleController");

router.get("/", getArticlesCtrl);

module.exports = router;