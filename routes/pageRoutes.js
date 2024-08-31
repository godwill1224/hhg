const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");

// home route
router.get("/", (req, res) => {
  // res.send("Welcome to HHG Management System");
  res.render("index");
});

// manager route
// connectEnsureLogin.ensureLoggedIn(),
router.get("/manager-dashboard-page", connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  // res.send("Welcome to HHG Management System");
  res.render("manager-dashboard");
});

// sales agent route
router.get("/sales-agent-dashboard-page", connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  // res.send("Welcome to HHG Management System");
  res.render("sales-agent-dashboard");
});


module.exports = router;