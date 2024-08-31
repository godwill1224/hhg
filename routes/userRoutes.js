const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");
const upload = require("../middlewares/upload");

const User = require("../models/userModel");

// Admin all users
router.get(
  "/all-users",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        const allUsers = await User.find().sort({ $natural: -1 });
        res.render("administrator/users-list", {
          users: allUsers,
          activeSidebarLink: "users",
        });
      } else {
        res.redirect("/login"); // Redirect to login or error page
      }
    } catch (error) {
      res.status(400).send("Unable to find users in your database!");
    }
  }
);

router.get("/add-user", (req, res) => {
  res.render("administrator/add-user", {
    activeSidebarLink: "users",
  });
});

// Handle add user with profile image upload
router.post("/add-user", upload.single("profileImage"), async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).render("administrator/add-user", {
        error: "A user with this email already exists!",
      });
    }

    // Prepare user data
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null; // Get the image URL
    const userData = {
      ...req.body,
      profileImage, // Add profile image URL
    };

    // Create new user
    const user = new User(userData);
    await User.register(user, req.body.password, (err) => {
      if (err) {
        throw err;
      }
      res.redirect("/all-users");
    });
  } catch (err) {
    console.log("Add user error:", err);
    res.status(400).render("administrator/add-user", {
      error: "Failed to add user. Please try again.",
    });
  }
});

// Admin update user
router.get(
  "/update-user/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        const dbUser = await User.findOne({ _id: req.params.id });
        res.render("administrator/update-user", {
          user: dbUser,
          activeSidebarLink: "users",
        });
      } else {
        res.redirect("/login"); // Redirect to login or error page
      }
    } catch (err) {
      res.status(400).send("Unable to find user in the database!");
    }
  }
);

router.post(
  "/update-user",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        await User.findOneAndUpdate({ _id: req.query.id }, req.body);
        res.redirect("/all-users");
      } else {
        res.redirect("/login"); // Redirect to login or error page
      }
    } catch (err) {
      res.status(404).send("Unable to update user in the database!");
    }
  }
);

// Admin delete User
router.post("/delete-user", async (req, res) => {
  try {
    if (req.session.user.role === "administrator") {
      await User.deleteOne({ _id: req.body.id });
      res.redirect("back");
    } else {
      res.redirect("/login"); // Redirect to login or error page
    }
  } catch (err) {
    res.status(400).send("Unable to delete user in the database!");
  }
});

module.exports = router;
