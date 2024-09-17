const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");
const upload = require("../utils/upload");
const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const Branch = require("../models/branch");
const { sendNotification } = require("../utils/notificationService");

// Common logic to fetch users based on role
const fetchUsersByRole = async (loggedInUser) => {
  let usersQuery = {};

  if (loggedInUser.role === "manager") {
    usersQuery = { branch: loggedInUser.branch };
  }

  return await User.find(usersQuery).sort({ $natural: -1 });
};

// All users
router.get(
  "/all-users",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });
      const allUsers = await fetchUsersByRole(loggedInUser);

      if (["administrator", "manager"].includes(loggedInUser.role)) {
        await sendNotification(
          "User List Accessed",
          "You have accessed the list of all users.",
          "success"
        );

        res.render(`${loggedInUser.role}/users-list`, {
          users: allUsers,
          loggedInUser: loggedInUser,
          activeSidebarLink: "users",
        });
      } else {
        await sendNotification(
          "Permission Denied",
          "Only administrators and managers can see all users.",
          "error"
        );
        res.redirect("/dashboard");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Get All Users",
        "Unable to retrieve users data. Please try again.",
        "error"
      );
      res.status(400).redirect("/dashboard");
      console.error("Error fetching users:", error);
    }
  }
);

// Admin add user
router.get(
  "/add-user",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });
      const allBranches = await Branch.find().sort({ $natural: -1 });

      if (req.session.user.role === "administrator") {
        res.render("administrator/add-user", {
          activeSidebarLink: "users",
          branches: allBranches,
          loggedInUser: loggedInUser,
        });
      } else {
        await sendNotification(
          "Permission Denied",
          "Only Administrators are allowed to add users.",
          "error"
        );
        res.redirect("/all-users");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Add User",
        "Unable to add new user. Please try again.",
        "error"
      );
      res.status(400).redirect("/dashboard");
      console.error("Error adding user:", error);
    }
  }
);

router.post("/add-user", upload.single("profileImage"), async (req, res) => {
  try {
    if (req.session.user.role === "administrator") {
      const existingUser = await User.findOne({ email: req.body.email });

      if (existingUser) {
        await sendNotification(
          "Add User Error",
          "A user with this email already exists!",
          "error"
        );

        return res.status(400).render("administrator/add-user");
      }

      const profileImage = req.file ? `/uploads/${req.file.filename}` : null;
      const userData = { ...req.body, profileImage };

      const user = new User(userData);
      await User.register(user, req.body.password, async (err) => {
        if (err) throw err;

        await sendNotification(
          "User Added",
          "A new user has been successfully added.",
          "success"
        );
        res.redirect("/all-users");
      });
      await sendNotification(
        "Permission Denied",
        "Only Administrators are allowed to add users.",
        "error"
      );
      res.redirect("/all-users");
    }
  } catch (error) {
    await sendNotification(
      "Failed To Add User",
      "Unable to add new user. Please try again.",
      "error"
    );
    res.status(400).redirect("/dashboard");
    console.error("Error adding user:", error);
  }
});

// View user
router.get(
  "/view-user/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      if (["administrator", "manager"].includes(loggedInUser.role)) {
        const dbUser = await User.findOne({ _id: req.params.id });
        res.render(`${loggedInUser.role}/user-details`, {
          user: dbUser,
          activeSidebarLink: "users",
          loggedInUser: loggedInUser,
        });

        await sendNotification(
          "User Details Accessed",
          `User details for ${dbUser.userName} have been fetched and viewed successfully.`,
          "success"
        );
      } else {
        await sendNotification(
          "Permission Denied",
          "Only administrators and managers can see all users' details.",
          "error"
        );
        res.redirect("/dashboard");
      }
    } catch (error) {
      await sendNotification(
        "Failed To View User",
        "Unable to view user record. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-users");
      console.error("Error viewing user:", error);
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
      const allBranches = await Branch.find().sort({ $natural: -1 });

      if (req.session.user.role === "administrator") {
        const dbUser = await User.findOne({ _id: req.params.id });
        res.render("administrator/update-user", {
          user: dbUser,
          branches: allBranches,
          activeSidebarLink: "users",
          loggedInUser: loggedInUser,
        });

        await sendNotification(
          "User Details Accessed",
          `User details for ${dbUser.userName} are ready for editing.`,
          "success"
        );
      } else {
        await sendNotification(
          "Permission Denied",
          "Only administrators and managers can perform this action' details.",
          "error"
        );
        res.redirect("/dashboard");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Fetch Fser",
        "Unable to fetch user. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-users");
      console.error("Error fetching user:", error);
    }
  }
);

router.post(
  "/update-user",
  connectEnsureLogin.ensureLoggedIn(),
  upload.single("profileImage"),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        const updateData = { ...req.body };
        const user = await User.findById(req.query.id);

        if (req.file) {
          if (user.profileImage && user.profileImage !== "/img/profile-img") {
            const oldImagePath = path.join(__dirname, "..", user.profileImage);
            fs.unlink(oldImagePath, (err) => {
              if (err)
                console.error(`Failed to delete old profile image: ${err}`);
            });
          }
          updateData.profileImage = `/uploads/${req.file.filename}`;
        }

        await User.findOneAndUpdate({ _id: req.query.id }, updateData);
        await sendNotification(
          "User Updated",
          "User details have been updated successfully.",
          "success"
        );

        res.redirect("/all-users");
      } else {
        await sendNotification(
          "Permission Denied",
          "Only administrators and managers can perform this action' details.",
          "error"
        );
        res.redirect("/dashboard");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Edit User",
        "Unable to edit user record. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-users");
      console.error("Error editing user:", error);
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
          if (err) console.error("Error deleting image:", err);
        });
      }

      await User.deleteOne({ _id: req.body.id });
      await sendNotification(
        "User Deleted",
        "A user has been deleted successfully.",
        "success"
      );

      res.redirect("/all-users");
    } else {
      await sendNotification(
        "Permission Denied",
        "Only administrators and managers can perform this action' details.",
        "error"
      );
      res.redirect("/dashboard");
    }
  } catch (error) {
    await sendNotification(
      "Failed To Delete User",
      "Unable to delete user record. Please try again.",
      "error"
    );
    res.status(400).redirect("/all-users");
    console.error("Error deleting user:", error);
  }
});

// View profile
router.get(
  "/profile",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      res.render(`${loggedInUser.role}/profile`, {
        loggedInUser: loggedInUser,
        activeSidebarLink: "profile",
      });

      await sendNotification(
        "Profile Accessed",
        "Your profile has been viewed.",
        "success"
      );
    } catch (error) {
      await sendNotification(
        "Failed To Access User Profile",
        "Unable to Access user profile. Please try again.",
        "error"
      );
      res.status(400).redirect("/dashboard");
      console.error("Error accessing user profile:", error);
    }
  }
);

// Edit profile
router.post(
  "/profile",
  connectEnsureLogin.ensureLoggedIn(),
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const updateData = { ...req.body };
      const user = await User.findById(req.query.id);

      if (req.file) {
        if (user.profileImage && user.profileImage !== "/img/profile-img") {
          const oldImagePath = path.join(__dirname, "..", user.profileImage);
          fs.unlink(oldImagePath, (err) => {
            if (err)
              console.error(`Failed to delete old profile image: ${err}`);
          });
        }
        updateData.profileImage = `/uploads/${req.file.filename}`;
      }

      await User.findOneAndUpdate({ _id: req.query.id }, updateData);
      await sendNotification(
        "Profile Updated",
        "Your profile has been updated successfully.",
        "success"
      );

      res.redirect("/profile");
    } catch (error) {
      await sendNotification(
        "Failed To Edit User Profile",
        "Unable to edit user profile. Please try again.",
        "error"
      );
      res.status(400).redirect("/dashboard");
      console.error("Error editing user profile:", error);
    }
  }
);

module.exports = router;
