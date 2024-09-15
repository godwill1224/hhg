const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");
const axios = require("axios");
const moment = require("moment");
const User = require("../models/user");
const Sale = require("../models/sale");

// Get all Sales
router.get(
  "/all-sales",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });
      let salesQuery = {};

      // Check user role and adjust the sales query accordingly
      if (loggedInUser.role === "administrator") {
        // Administrator: Can see all sales
        salesQuery = {};
      } else if (loggedInUser.role === "manager") {
        // Manager: Can only see sales from their branch
        salesQuery = { saleBranch: loggedInUser.branch };
      } else if (loggedInUser.role === "sales-agent") {
        // Sales Agent: Can only see sales made by themselves
        salesQuery = { soldBy: loggedInUser._id };
      } else {
        // Handle unauthorized access
        return res
          .status(403)
          .send("You are not authorized to view this page!");
      }

      // Fetch sales based on the query and sort by date
      const sales = await Sale.find(salesQuery).sort({ $natural: -1 });

      // Format the date using Moment.js
      const formattedSales = sales.map((sale) => {
        const { dateSold } = sale;
        return {
          ...sale._doc,
          formattedDate: moment(dateSold).format("YYYY-MM-DD (h:mm A)"),
        };
      });

      // Send notification
      await axios.post("http://localhost:4500/notifications", {
        title: "Sales List Accessed",
        message: `You have accessed the sales list as a ${loggedInUser.role}.`,
        notificationType: "success",
      });

      // Check user role and adjust the sales query accordingly
      if (loggedInUser.role === "administrator") {
        res.render("administrator/sales-list", {
          sales: formattedSales,
          activeSidebarLink: "sales",
          loggedInUser: loggedInUser,
        });
      } else if (req.session.user.role === "manager") {
        res.render("manager/sales-list", {
          sales: formattedSales,
          activeSidebarLink: "sales",
          loggedInUser: loggedInUser,
        });
      } else if (req.session.user.role === "sales-agent") {
        res.render("sales-agent/sales-list", {
          sales: formattedSales,
          activeSidebarLink: "sales",
          loggedInUser: loggedInUser,
        });
      } else {
        // Handle unauthorized access
        return res
          .status(403)
          .send("You are not authorized to view this page!");
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(400).send("Unable to find sales in your database!");
    }
  }
);

// Add new sale (GET)
router.get(
  "/add-sale",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      if (req.session.user.role === "manager") {
        res.render("manager/add-sale", {
          activeSidebarLink: "sales",
          loggedInUser: loggedInUser,
        });
      } else if (req.session.user.role === "sales-agent") {
        res.render("sales-agent/add-sale", {
          activeSidebarLink: "sales",
          loggedInUser: loggedInUser,
        });
      } else {
        res
          .status(403)
          .send("Only managers and agents are allowed to access this page!");
      }
    } catch (error) {
      console.error("Error fetching user", error);
      res.status(400).send("Unable to find user in your database!");
    }
  }
);

// Admin: Add new sale (POST)
router.post(
  "/add-sale",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (
        req.session.user.role === "manager" ||
        req.session.user.role === "sales-agent"
      ) {
        const newSale = new Sale(req.body);
        await newSale.save();

        // Send a notification for sale addition
        await axios.post("http://localhost:4500/notifications", {
          title: "Sale Record Added",
          message: "A new sale has been successfully made.",
          notificationType: "success",
        });

        res.redirect("/all-sales");
      } else {
        res
          .status(403)
          .send("Only managers and sales agents are allowed to make a sale!");
      }
    } catch (err) {
      console.error("Add sale error:", err);
      res.status(400).render("administrator/add-sale", {
        error: "Failed to add sale. Please try again.",
      });
    }
  }
);

// View sale
router.get(
  "/view-sale/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      const dbSale = await Sale.findOne({ _id: req.params.id });

      // Send a notification for viewing sale details
      await axios.post("http://localhost:4500/notifications", {
        title: "Sale Details Accessed",
        message: `Sale details for ${dbSale.produceName} have been accessed for veiwing.`,
        notificationType: "success",
      });

      if (loggedInUser.role === "administrator") {
        res.render("administrator/sale-details", {
          sale: dbSale,
          activeSidebarLink: "sales",
          loggedInUser: loggedInUser,
        });
      } else if (loggedInUser.role === "manager") {
        res.render("manager/sale-details", {
          sale: dbSale,
          activeSidebarLink: "sales",
          loggedInUser: loggedInUser,
        });
      } else if (loggedInUser.role === "sales-agent") {
        res.render("sales-agent/sale-details", {
          sale: dbSale,
          activeSidebarLink: "sales",
          loggedInUser: loggedInUser,
        });
      } else {
        res.status(403).send("You are not allowed to access this page!");
      }
    } catch (err) {
      console.error("Error fetching sale details:", err);
      res.status(400).send("Unable to find sale in the database!");
    }
  }
);

// Admin: Update sale (GET)
router.get(
  "/update-sale/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      if (req.session.user.role === "administrator") {
        const dbSale = await Branch.findOne({ _id: req.params.id });

        // Send a notification for viewing sale details
        await axios.post("http://localhost:4500/notifications", {
          title: "Sale Details Accessed",
          message: `Sale details for ${dbSale.produceName} have been accessed for editing.`,
          notificationType: "success",
        });

        res.render("administrator/update-sale", {
          sale: dbSale,
          activeSidebarLink: "sales",
          loggedInUser: loggedInUser,
        });
      } else {
        res
          .status(403)
          .send("Only Administrators are allowed to access this page!");
      }
    } catch (err) {
      console.error("Error fetching sale details:", err);
      res.status(400).send("Unable to find sale in the database!");
    }
  }
);

// Admin: Update sale (POST)
router.post(
  "/update-sale",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        await Branch.findOneAndUpdate({ _id: req.query.id }, req.body);

        // Send a notification for sale update
        await axios.post("http://localhost:4500/notifications", {
          title: "Branch Updated",
          message: "Branch details have been updated successfully.",
          notificationType: "success",
        });

        res.redirect("/all-sales");
      } else {
        res
          .status(403)
          .send("Only Administrators are allowed to update a branch!");
      }
    } catch (err) {
      console.error("Error updating stock:", err);
      res.status(400).send("Unable to update stock in the database!");
    }
  }
);

// Admin: Delete stock (POST)
router.post(
  "/delete-stock",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        await Branch.deleteOne({ _id: req.body.id });

        // Send a notification for stock deletion
        await axios.post("http://localhost:4500/notifications", {
          title: "Branch Deleted",
          message: "A branch has been deleted successfully.",
          notificationType: "success",
        });

        res.redirect("back");
      } else {
        res
          .status(403)
          .send("Only Administrators are allowed to delete a stocks!");
      }
    } catch (err) {
      console.error("Error deleting stock:", err);
      res.status(400).send("Unable to delete stock in the database!");
    }
  }
);

module.exports = router;
