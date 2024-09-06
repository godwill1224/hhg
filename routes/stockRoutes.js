const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");
const axios = require("axios");
const Stock = require("../models/stock");
const moment = require("moment");
const User = require("../models/user");

// Admin: Get all stock
router.get(
  "/all-stock",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      // Ensure the user session and role are valid
      if (req.session.user && req.session.user.role === "administrator") {
        const allStock = await Stock.find().sort({ $natural: -1 });

        // Destructure and format only the dateAdded field using Moment.js
        const formattedStock = allStock.map((produce) => {
          const { dateAdded } = produce;
          return {
            ...produce._doc, // Spread the rest of the stock data
            formattedDate: moment(dateAdded).format("YYYY-MM-DD (h:mm A)"), // Format the date
          };
        });

        await axios.post("http://localhost:4500/notifications", {
          title: "Stock List Accessed",
          message: "You have accessed the list of all stock.",
          notificationType: "success",
        });

        // Render the stock list page for the administrator, with formatted dates
        res.render("administrator/stock-list", {
          stock: formattedStock, // Send the formatted data to the view
          activeSidebarLink: "stock",
          loggedInUser: loggedInUser,
        });

      } else {
        // Handle unauthorized access
        res
          .status(403)
          .send("Only Administrators are allowed to access this page!");
      }
    } catch (error) {
      console.error("Error fetching Stock:", error);
      res.status(400).send("Unable to find stock in your database!");
    }
  }
);

// Admin: Add new stock (GET)
router.get("/add-stock", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const loggedInUser = await User.findOne({ _id: req.session.user._id });

    if (req.session.user.role === "administrator") {
      res.render("administrator/add-stock", {
        activeSidebarLink: "stock",
        loggedInUser: loggedInUser,
      });
    } else {
      res
        .status(403)
        .send("Only Administrators are allowed to access this page!");
    }
  } catch (error) {
     console.error("Error fetching user", error);
      res.status(400).send("Unable to find user in your database!");
  }

});

// Admin: Add new stock (POST)
router.post(
  "/add-stock",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        const newProduce = new Stock(req.body);
        await newProduce.save();

        // Send a notification for stock addition
        await axios.post("http://localhost:4500/notifications", {
          title: "Produce Added",
          message: "A new Produce has been successfully added.",
          notificationType: "success",
        });

        res.redirect("/all-stock");
      } else {
        res
          .status(403)
          .send("Only Administrators are allowed to add a produce!");
      }
    } catch (err) {
      console.error("Add Produce error:", err);
      res.status(400).render("administrator/add-stock", {
        error: "Failed to add produce. Please try again.",
      });
    }
  }
);

// Admin: View stock (GET)
router.get(
  "/view-stock/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      if (req.session.user.role === "administrator") {
        const dbProduce = await Stock.findOne({ _id: req.params.id });

        // Send a notification for viewing stock details
        await axios.post("http://localhost:4500/notifications", {
          title: "Produce Details Accessed",
          message: `Produce details for ${dbProduce.produceName} have been accessed for veiwing.`,
          notificationType: "success",
        });

        res.render("administrator/stock-details", {
          produce: dbProduce,
          activeSidebarLink: "stock",
          loggedInUser: loggedInUser,
        });
      } else {
        res
          .status(403)
          .send("Only Administrators are allowed to access this page!");
      }
    } catch (err) {
      console.error("Error fetching stock details:", err);
      res.status(400).send("Unable to find stock in the database!");
    }
  }
);

// Admin: Update stock (GET)
router.get(
  "/update-stock/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      if (req.session.user.role === "administrator") {
        const dbProduce = await Branch.findOne({ _id: req.params.id });

        // Send a notification for viewing stock details
        await axios.post("http://localhost:4500/notifications", {
          title: "Produce Details Accessed",
          message: `Produce details for ${dbProduce.produceName} have been accessed for editing.`,
          notificationType: "success",
        });

        res.render("administrator/update-stock", {
          produce: dbProduce,
          activeSidebarLink: "stock",
          loggedInUser: loggedInUser,
        });
      } else {
        res
          .status(403)
          .send("Only Administrators are allowed to access this page!");
      }
    } catch (err) {
      console.error("Error fetching branch details:", err);
      res.status(400).send("Unable to find branch in the database!");
    }
  }
);

// Admin: Update stock (POST)
router.post(
  "/update-stock",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        await Branch.findOneAndUpdate({ _id: req.query.id }, req.body);

        // Send a notification for stock update
        await axios.post("http://localhost:4500/notifications", {
          title: "Branch Updated",
          message: "Branch details have been updated successfully.",
          notificationType: "success",
        });

        res.redirect("/all-branches");
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
