const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");
const upload = require("../middlewares/upload");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const User = require("../models/user");

// View profile
router.get(
  "/profile",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      // Fetch the current logged-in user's details
      const loggedInUser = await User.findOne({ _id: req.session.user._id });
      if (req.session.user.role === "administrator") {
        res.render("administrator/profile", {
          loggedInUser: loggedInUser,
          activeSidebarLink: "profile",
        });
      } else if (req.session.user.role === "manager") {
        res.render("manager/profile", {
          loggedInUser: loggedInUser,
          activeSidebarLink: "profile",
        });
      } else if (req.session.user.role === "sales-agent") {
        res.render("sales-agent/profile", {
          loggedInUser: loggedInUser,
          activeSidebarLink: "profile",
        });
      } else {
        res.status(403).send("User with that role does not exist in the database!");
      }
      // Send a notification for profile access
      await axios.post("http://localhost:4500/notifications", {
        title: "Profile Accessed",
        message: `Your profile has been viewed.`,
        notificationType: "success",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(400).send("Unable to fetch your profile data!");
    }
  }
);

// edit profile
router.post(
  "/profile",
  connectEnsureLogin.ensureLoggedIn(),
  upload.single("profileImage"), // Multer middleware for single file upload
  async (req, res) => {
    try {
      const updateData = { ...req.body };
      const user = await User.findById(req.query.id);

      // Handle profile image update and deletion
      if (req.file) {
        // Delete the old profile image if it exists and is different from the default
        if (user.profileImage && user.profileImage !== "/img/profile-img") {
          const oldImagePath = path.join(__dirname, "..", user.profileImage);
          fs.unlink(oldImagePath, (err) => {
            if (err)
              console.error(`Failed to delete old profile image: ${err}`);
          });
        }
        // Set the new profile image path
        updateData.profileImage = `/uploads/${req.file.filename}`;
      }

      // Update the user with new data
      await User.findOneAndUpdate({ _id: req.query.id }, updateData);

      // Send a notification for successful update
      await axios.post("http://localhost:4500/notifications", {
        title: "Profile Info Updated",
        message: "You have sucessfully updated your profile information.",
        notificationType: "success",
      });

      res.redirect("/profile");
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).send("Unable to update user in the database!");
    }
  }
);

// all users
router.get(
  "/all-users",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      if (req.session.user.role === "administrator") {
        const allUsers = await User.find().sort({ $natural: -1 });

        // Send a notification via the API
        await axios.post("http://localhost:4500/notifications", {
          title: "User List Accessed",
          message: "You have accessed the list of all users.",
          notificationType: "success",
        });

        res.render("administrator/users-list", {
          users: allUsers,
          loggedInUser: loggedInUser,
          activeSidebarLink: "users",
        });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(400).send("Unable to find users in your database!");
    }
  }
);

// Admin add user
router.get("/add-user", async (req, res) => {
  try {
    const loggedInUser = await User.findOne({ _id: req.session.user._id });

    res.render("administrator/add-user", {
      activeSidebarLink: "users",
      loggedInUser: loggedInUser,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(400).send("Unable to find user in your database!");
  }
});

// Handle add user with profile image upload
router.post("/add-user", upload.single("profileImage"), async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      // Send a notification via the API for error
      await axios.post("http://localhost:4500/notifications", {
        title: "Add User Error",
        message: "A user with this email already exists!",
        notificationType: "error",
      });

      return res.status(400).render("administrator/add-user", {
        error: "A user with this email already exists!",
      });
    }

    // Prepare user data
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;
    const userData = { ...req.body, profileImage };

    // Create new user
    const user = new User(userData);

    await User.register(user, req.body.password, async (err) => {
      if (err) {
        throw err;
      }

      // Send a notification for successful addition
      await axios.post("http://localhost:4500/notifications", {
        title: "User Added",
        message: "A new user has been successfully added.",
        notificationType: "success",
      });

      res.redirect("/all-users");
    });
  } catch (err) {
    console.log("Add user error:", err);
    res.status(400).render("administrator/add-user", {
      error: "Failed to add user. Please try again.",
    });
  }
});

// View user
router.get(
  "/view-user/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      if (req.session.user.role === "administrator") {
        const dbUser = await User.findOne({ _id: req.params.id });
        res.render("administrator/user-details", {
          user: dbUser,
          activeSidebarLink: "users",
          loggedInUser: loggedInUser,
        });

        // Send a notification for viewing user details
        await axios.post("http://localhost:4500/notifications", {
          title: "User Details Accessed",
          message: `User details for ${dbUser.userName} have been fetched and viewed successfully.`,
          notificationType: "success",
        });
      } else {
        res.redirect("/login");
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      res.status(400).send("Unable to find user in the database!");
    }
  }
);

// Admin update user
router.get(
  "/update-user/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      if (req.session.user.role === "administrator") {
        const dbUser = await User.findOne({ _id: req.params.id });
        res.render("administrator/update-user", {
          user: dbUser,
          activeSidebarLink: "users",
          loggedInUser: loggedInUser,
        });

        // Send a notification for viewing user details
        await axios.post("http://localhost:4500/notifications", {
          title: "User Details Accessed",
          message: `User details for ${dbUser.userName} have been accessed and ready for editting.`,
          notificationType: "success",
        });
      } else {
        res.redirect("/login");
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      res.status(400).send("Unable to find user in the database!");
    }
  }
);

router.post(
  "/update-user",
  connectEnsureLogin.ensureLoggedIn(),
  upload.single("profileImage"), // Multer middleware for single file upload
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        const updateData = { ...req.body };
        const user = await User.findById(req.query.id);

        // Handle profile image update and deletion
        if (req.file) {
          // Delete the old profile image if it exists and is different from the default
          if (user.profileImage && user.profileImage !== "/img/profile-img") {
            const oldImagePath = path.join(__dirname, "..", user.profileImage);
            fs.unlink(oldImagePath, (err) => {
              if (err)
                console.error(`Failed to delete old profile image: ${err}`);
            });
          }
          // Set the new profile image path
          updateData.profileImage = `/uploads/${req.file.filename}`;
        }

        // Update the user with new data
        await User.findOneAndUpdate({ _id: req.query.id }, updateData);

        // Send a notification for successful update
        await axios.post("http://localhost:4500/notifications", {
          title: "User Updated",
          message: "User details have been updated successfully.",
          notificationType: "success",
        });

        res.redirect("/all-users");
      } else {
        res.redirect("/login");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).send("Unable to update user in the database!");
    }
  }
);

// Admin delete User
router.post("/delete-user", async (req, res) => {
  try {
    if (req.session.user.role === "administrator") {
      const user = await User.findOne({ _id: req.body.id });

      if (user && user.profileImage) {
        const imagePath = path.join(__dirname, "..", user.profileImage);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Error deleting image:", err);
          }
        });
      }

      await User.deleteOne({ _id: req.body.id });

      // Send a notification for successful deletion
      await axios.post("http://localhost:4500/notifications", {
        title: "User Deleted",
        message: "A user has been deleted successfully.",
        notificationType: "success",
      });

      res.redirect("/all-users");
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(400).send("Unable to delete user in the database!");
  }
});

module.exports = router;
