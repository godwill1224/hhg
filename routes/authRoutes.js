const express = require("express");
const passport = require("passport");
const router = express.Router();
const io = require("../server"); // Import the initialized io

// Login Routes
router.get("/login", (req, res) => {
  res.render("login");
  io.emit("notification", {
    title: "Login page",
    body: `Welcome!`,
    icon: "/images/notification-icon.png",
  });
});

// Route to handle login
router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = req.user;

    // Redirect based on the user's role
    if (req.user.role === "administrator") {
      res.redirect("/all-users");
      io.emit("notification", {
        title: "Login Successful",
        body: `Welcome!`,
        icon: "/images/notification-icon.png",
      });
    } else if (req.user.role === "sales-agent") {
      res.redirect("/sales-agent-dashboard-page");
    } else {
      res.send("User with that role does not exist in the system!");
    }
  }
);

// Logout route
router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Error logging out!");
      }
      res.redirect("/");
    });
  } else {
    res.send("You donot have a session!");
  }
});

module.exports = router;
