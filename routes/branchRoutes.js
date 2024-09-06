const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");
const axios = require("axios");
const Branch = require("../models/branch");
const moment = require('moment'); 
const User = require("../models/user");

// Admin: Get all branches
router.get(
"/all-branches",
connectEnsureLogin.ensureLoggedIn(),
async (req, res) => {
  try {
    const loggedInUser = await User.findOne({ _id: req.session.user._id });

    // Ensure the user session and role are valid
    if (req.session.user && req.session.user.role === "administrator") {
      const allBranches = await Branch.find().sort({ $natural: -1 });

      // Destructure and format only the dateCreated field using Moment.js
      const formattedBranches = allBranches.map(branch => {
        const { dateCreated } = branch;
        return {
          ...branch._doc, // Spread the rest of the branch data
          formattedDate: moment(dateCreated).format('YYYY-MM-DD (h:mm A)'), // Format the date
        };
      });

      try {
        // Send a notification for accessing the branch list
        await axios.post("http://localhost:4500/notifications", {
          title: "Branch List Accessed",
          message: "You have accessed the list of all branches.",
          notificationType: "success",
        });
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
      }

      // Render the branch list page for the administrator, with formatted dates
      res.render("administrator/branch-list", {
        branches: formattedBranches,  // Send the formatted data to the view
        activeSidebarLink: "branches",
        loggedInUser: loggedInUser,
      });
    } else {
      // Handle unauthorized access
      res.status(403).send("Only Administrators are allowed to access this page!");
    }
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(400).send("Unable to find branches in your database!");
  }
}
);


// Admin: Add new branch (GET)
router.get(
  "/add-branch",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      if (req.session.user.role === "administrator") {
        res.render("administrator/add-branch", {
          activeSidebarLink: "branches",
          loggedInUser: loggedInUser,
        });
      } else {
        res.status(403).send("Only Administrators are allowed to access this page!");
      }
    } catch (error) {
      console.error("Error fetching user", error);
      res.status(400).send("Unable to find user in your database!");
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

        // Send a notification for branch addition
        await axios.post("http://localhost:4500/notifications", {
          title: "Branch Added",
          message: "A new branch has been successfully added.",
          notificationType: "success",
        });

        res.redirect("/all-branches");
      } else {
        res.status(403).send("Only Administrators are allowed to add a branch!");
      }
    } catch (err) {
      console.error("Add branch error:", err);
      res.status(400).render("administrator/add-branch", {
        error: "Failed to add branch. Please try again.",
      });
    }
  }
);

// Admin: View branch (GET)
router.get(
  "/view-branch/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      if (req.session.user.role === "administrator") {
        const dbBranch = await Branch.findOne({ _id: req.params.id });

        // Send a notification for viewing branch details
        await axios.post("http://localhost:4500/notifications", {
          title: "Branch Details Accessed",
          message: `Branch details for ${dbBranch.branchName} have been accessed for veiwing.`,
          notificationType: "success",
        });

        res.render("administrator/branch-details", {
          branch: dbBranch,
          activeSidebarLink: "branches",
          loggedInUser: loggedInUser,
        });
      } else {
        res.status(403).send("Only Administrators are allowed to access this page!");
      }
    } catch (err) {
      console.error("Error fetching branch details:", err);
      res.status(400).send("Unable to find branch in the database!");
    }
  }
);

// Admin: Update branch (GET)
router.get(
  "/update-branch/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      if (req.session.user.role === "administrator") {
        const dbBranch = await Branch.findOne({ _id: req.params.id });

        // Send a notification for viewing branch details
        await axios.post("http://localhost:4500/notifications", {
          title: "Branch Details Accessed",
          message: `Branch details for ${dbBranch.branchName} have been accessed for editing.`,
          notificationType: "success",
        });

        res.render("administrator/update-branch", {
          branch: dbBranch,
          activeSidebarLink: "branches",
          loggedInUser: loggedInUser,
        });
      } else {
        res.status(403).send("Only Administrators are allowed to access this page!");
      }
    } catch (err) {
      console.error("Error fetching branch details:", err);
      res.status(400).send("Unable to find branch in the database!");
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
        await Branch.findOneAndUpdate({ _id: req.query.id }, req.body);

        // Send a notification for branch update
        await axios.post("http://localhost:4500/notifications", {
          title: "Branch Updated",
          message: "Branch details have been updated successfully.",
          notificationType: "success",
        });

        res.redirect("/all-branches");
      } else {
        res.status(403).send("Only Administrators are allowed to update a branch!");
      }
    } catch (err) {
      console.error("Error updating branch:", err);
      res.status(400).send("Unable to update branch in the database!");
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
        await Branch.deleteOne({ _id: req.body.id });

        // Send a notification for branch deletion
        await axios.post("http://localhost:4500/notifications", {
          title: "Branch Deleted",
          message: "A branch has been deleted successfully.",
          notificationType: "success",
        });

        res.redirect("back");
      } else {
        res.status(403).send("Only Administrators are allowed to delete a branch!");
      }
    } catch (err) {
      console.error("Error deleting branch:", err);
      res.status(400).send("Unable to delete branch in the database!");
    }
  }
);

module.exports = router;
