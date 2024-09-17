const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");
const moment = require("moment");
const User = require("../models/user");
const Stock = require("../models/stock");
const { sendNotification } = require("../utils/notificationService");

// Common logic to fetch user and sales based on role
const fetchStockByRole = async (loggedInUser) => {
  let stockQuery = {};

  if (loggedInUser.role === "manager" || loggedInUser.role === "sales-agent") {
    stockQuery = { storagebranch: loggedInUser.branch };
  }

  const sortedStock = await Stock.find(stockQuery).sort({ $natural: -1 });
  return sortedStock.map((produce) => ({
    ...produce._doc,
    formattedDate: moment(produce.dateAdded).format("YYYY-MM-DD (h:mm A)"),
  }));
};

// Get all stock
router.get(
  "/all-stock",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);
      const formattedStock = await fetchStockByRole(loggedInUser);

      await sendNotification(
        "Stock List Accessed",
        "You have accessed the list of all stock.",
        "success"
      );

      res.render(`${loggedInUser.role}/stock-list`, {
        stock: formattedStock,
        activeSidebarLink: "stock",
        loggedInUser,
      });
    } catch (error) {
      await sendNotification(
        "Failed To Fetch Stock",
        "Unable to find stock in the database.",
        "error"
      );
      res.status(400).redirect("/dashboard");
      console.error("Error fetching stock:", error);
    }
  }
);

// Add new stock (GET)
router.get(
  "/add-stock",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);

      if (loggedInUser.role === "manager") {
        res.render("manager/add-stock", {
          activeSidebarLink: "stock",
          loggedInUser,
        });
      } else {
        await sendNotification(
          "Permission Denied",
          "Only Managers are allowed to add stock.",
          "error"
        );
        res.redirect("/all-stock");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Add Stock",
        "Unable to load the add stock page. Please try again.",
        "error"
      );
      res.status(400).redirect("/dashboard");
      console.error("Error loading add stock page:", error);
    }
  }
);

// Add new stock (POST)
router.post(
  "/add-stock",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "manager") {
        const newProduce = new Stock(req.body);
        await newProduce.save();

        await sendNotification(
          "Stock Added",
          "A new produce has been successfully added.",
          "success"
        );
        res.redirect("/all-stock");
      } else {
        await sendNotification(
          "Permission Denied",
          "Only Managers are allowed to add stock.",
          "error"
        );
        res.redirect("/all-stock");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Add Stock",
        "Unable to add the stock. Please try again.",
        "error"
      );
      res.status(400).redirect("/dashboard");
      console.error("Error adding stock:", error);
    }
  }
);

// View stock details
router.get(
  "/view-stock/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);
      const dbProduce = await Stock.findById(req.params.id);

      await sendNotification(
        "Stock Details Accessed",
        `Produce details for ${dbProduce.produceName} have been accessed for viewing.`,
        "success"
      );

      res.render(`${loggedInUser.role}/stock-details`, {
        produce: dbProduce,
        activeSidebarLink: "stock",
        loggedInUser,
      });
    } catch (error) {
      await sendNotification(
        "Failed To View Stock",
        "Unable to view stock details. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-stock");
      console.error("Error viewing stock details:", error);
    }
  }
);

// Update stock (GET)
router.get(
  "/update-stock/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);

      if (loggedInUser.role === "manager") {
        const dbProduce = await Stock.findById(req.params.id);

        await sendNotification(
          "Stock Details Accessed",
          `Produce details for ${dbProduce.produceName} have been accessed for editing.`,
          "success"
        );
        res.render("manager/update-stock", {
          produce: dbProduce,
          activeSidebarLink: "stock",
          loggedInUser,
        });
      } else {
        await sendNotification(
          "Permission Denied",
          "Only Managers are allowed to edit stock.",
          "error"
        );
        res.redirect("/all-stock");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Edit Stock",
        "Unable to load the stock for editing. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-stock");
      console.error("Error loading stock for editing:", error);
    }
  }
);

// Update stock (POST)
router.post(
  "/update-stock",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "manager") {
        await Stock.findByIdAndUpdate(req.query.id, req.body);

        await sendNotification(
          "Stock Updated",
          "Stock details have been successfully updated.",
          "success"
        );
        res.redirect("/all-stock");
      } else {
        await sendNotification(
          "Permission Denied",
          "Only Managers are allowed to update stock.",
          "error"
        );
        res.redirect("/all-stock");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Update Stock",
        "Unable to update stock. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-stock");
      console.error("Error updating stock:", error);
    }
  }
);

// Delete stock
router.post(
  "/delete-stock",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "manager") {
        await Stock.findByIdAndDelete(req.body.id);

        await sendNotification(
          "Stock Deleted",
          "Stock has been successfully deleted.",
          "success"
        );
        res.redirect("/all-stock");
      } else {
        await sendNotification(
          "Permission Denied",
          "Only Managers are allowed to delete stock.",
          "error"
        );
        res.redirect("/all-stock");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Delete Stock",
        "Unable to delete stock. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-stock");
      console.error("Error deleting stock:", error);
    }
  }
);

module.exports = router;
