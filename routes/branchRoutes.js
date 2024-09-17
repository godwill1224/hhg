const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");
const axios = require("axios");
const Branch = require("../models/branch");
const moment = require('moment'); 
const User = require("../models/user");
const { sendNotification } = require("../utils/notificationService");

// Admin: Get all branches
router.get(
  "/all-branches",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);

      if (loggedInUser && req.session.user.role === "administrator") {
        const branches = await Branch.find().sort({ $natural: -1 });

        const formattedBranches = branches.map(branch => ({
          ...branch._doc,
          formattedDate: moment(branch.dateCreated).format('YYYY-MM-DD (h:mm A)'),
        }));

        await sendNotification(
          "Branch List Accessed",
          "You have accessed the list of all branches.",
          "success"
        );

        res.render("administrator/branch-list", {
          branches: formattedBranches,
          activeSidebarLink: "branches",
          loggedInUser,
        });
      } else {
        res.status(403).send("Unauthorized access! Only Administrators can access this page.");
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      
      // Send error notification
      await sendNotification(
        "Error Fetching Branches",
        "An error occurred while retrieving the branches.",
        "error"
      );
    }
  }
);

// Admin: Add new branch (GET)
router.get(
  "/add-branch",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);

      if (loggedInUser.role === "administrator") {
        res.render("administrator/add-branch", {
          activeSidebarLink: "branches",
          loggedInUser,
        });
      } else {
        res.status(403).send("Unauthorized access! Only Administrators can access this page.");
      }
    } catch (error) {
      console.error("Error fetching user", error);

      // Send error notification
      await sendNotification(
        "Error Accessing Add Branch Page",
        "An error occurred while trying to access the add branch page.",
        "error"
      );
    }
  }
);

// Admin: Add new branch (POST)
router.post(
  "/add-branch",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        const newBranch = new Branch(req.body);
        await newBranch.save();

        // Success notification
        await sendNotification(
          "Branch Added",
          "A new branch has been successfully added.",
          "success"
        );

        res.redirect("/all-branches");
      } else {
        res.status(403).send("Unauthorized access! Only Administrators can add a branch.");
      }
    } catch (error) {
      console.error("Add branch error:", error);

      // Send error notification
      await sendNotification(
        "Error Adding Branch",
        "An error occurred while trying to add a new branch.",
        "error"
      );

      res.status(500).render("administrator/add-branch");
    }
  }
);

// Admin: View branch (GET)
router.get(
  "/view-branch/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);

      if (loggedInUser.role === "administrator") {
        const dbBranch = await Branch.findById(req.params.id);

        // Success notification
        await sendNotification(
          "Branch Details Accessed",
          `Branch details for ${dbBranch.branchName} have been accessed for viewing.`,
          "success"
        );

        res.render("administrator/branch-details", {
          branch: dbBranch,
          activeSidebarLink: "branches",
          loggedInUser,
        });
      } else {
        res.status(403).send("Unauthorized access! Only Administrators can access this page.");
      }
    } catch (error) {
      console.error("Error fetching branch details:", error);

      // Send error notification
      await sendNotification(
        "Error Fetching Branch Details",
        "An error occurred while trying to retrieve the branch details.",
        "error"
      );
    }
  }
);

// Admin: Update branch (POST)
router.post(
  "/update-branch",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        await Branch.findByIdAndUpdate(req.query.id, req.body);

        // Success notification
        await sendNotification(
          "Branch Updated",
          "Branch details have been updated successfully.",
          "success"
        );

        res.redirect("/all-branches");
      } else {
        res.status(403).send("Unauthorized access! Only Administrators can update a branch.");
      }
    } catch (error) {
      console.error("Error updating branch:", error);

      // Send error notification
      await sendNotification(
        "Error Updating Branch",
        "An error occurred while trying to update the branch details.",
        "error"
      );
    }
  }
);

// Admin: Delete branch (POST)
router.post(
  "/delete-branch",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        await Branch.findByIdAndDelete(req.body.id);

        // Success notification
        await sendNotification(
          "Branch Deleted",
          "A branch has been deleted successfully.",
          "success"
        );

        res.redirect("/all-branches");
      } else {
        res.status(403).send("Unauthorized access! Only Administrators can delete a branch.");
      }
    } catch (error) {
      console.error("Error deleting branch:", error);

      // Send error notification
      await sendNotification(
        "Error Deleting Branch",
        "An error occurred while trying to delete the branch.",
        "error"
      );
    }
  }
);

module.exports = router;
