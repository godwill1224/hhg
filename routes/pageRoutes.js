const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");
const User = require("../models/user");
const { sendNotification } = require("../utils/notificationService");

// home route
router.get("/", (req, res) => {
  res.render("index");
});

// dashboard route
router.get(
  "/dashboard",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);

      await sendNotification(
        "Dasboard Accessed",
        "Dasboard page has been successfully accessed.",
        "success"
      );

      res.render(`${loggedInUser.role}/dashboard`, {
        activeSidebarLink: "dashboard",
        loggedInUser,
      });
    } catch (error) {
      await sendNotification(
        "Failed To View dashboard",
        "Unable to view dashboard page. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-stock");
      console.error("Error viewing dashboard page:", error);
    }
  }
);

module.exports = router;