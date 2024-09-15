const express = require("express");
const passport = require("passport");
const router = express.Router();
const axios = require("axios"); // For making HTTP requests

// Login Routes
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Send a failure notification via the API
      try {
        await axios.post("http://localhost:4500/notifications", {
          title: "Login Failed",
          message: "Invalid username or password.",
          notificationType: "error",
        });
      } catch (error) {
        console.error("Error sending failure notification:", error);
      }

      return res.redirect("/login");
    }

    // Successful login
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }

      req.session.user = req.user;

      try {
        // Send a success notification via the API
        await axios.post("http://localhost:4500/notifications", {
          title: "Login Successful",
          message: `Welcome ${req.user.userName}!`,
          notificationType: "success",
        });

        // Redirect based on the user's role
        if (req.user.role === "administrator") {
          res.redirect("/all-users");
        } else if (req.user.role === "manager") {
          res.redirect("/all-stock");
        } else if (req.user.role === "sales-agent") {
          res.redirect("/sales-agent-dashboard-page");
        } else {
          res.send("User with that role does not exist in the system!");
        }
      } catch (error) {
        console.error("Error sending success notification:", error);
        res
          .status(500)
          .send("Login successful, but failed to send notification.");
      }
    });
  })(req, res, next);
});

// Logout route
router.get("/logout", async (req, res) => {
  if (req.session) {
    req.session.destroy(async (err) => {
      if (err) {
        return res.status(500).send("Error logging out!");
      }

      // Send a logout success notification via the API
      try {
        await axios.post("http://localhost:4500/notifications", {
          title: "Logout Successful",
          message: "You have successfully logged out.",
          notificationType: "success",
        });
      } catch (error) {
        console.error("Error sending logout notification:", error);
      }

      res.redirect("/");
    });
  } else {
    res.send("You do not have a session!");
  }
});

module.exports = router;
