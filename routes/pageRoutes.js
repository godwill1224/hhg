const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");

// home route
router.get("/", (req, res) => {
  res.render("index");
});


module.exports = router;