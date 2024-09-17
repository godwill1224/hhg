const express = require("express");
const passport = require("passport");
const router = express.Router();
const { sendNotification } = require("../utils/notificationService");

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
      // Send a failure notification
      await sendNotification("Login Failed", "Invalid username or password.", "error");
      return res.redirect("/login");
    }

    // Successful login
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }

      req.session.user = req.user;

      try {
        // Send a success notification
        await sendNotification("Login Successful", `Welcome ${req.user.userName}!`, "success");

        // Redirect based on the user's role
        if (req.user.role === "administrator") {
          res.redirect("/dashboard");
        } else if (req.user.role === "manager") {
          res.redirect("/dashboard");
        } else if (req.user.role === "sales-agent") {
          res.redirect("/dashboard");
        }
        
      } catch (error) {
        console.error("Error sending success notification:", error);
        res.status(500).send("Login successful, but failed to send notification.");
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

      // Send a logout success notification
      await sendNotification("Logout Successful", "You have successfully logged out.", "success");

      res.redirect("/");
    });
  } else {
    await sendNotification("Logout Failed", "You do not have a session.", "error");

    res.redirect("/");
  }
});

module.exports = router;
