const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");
const axios = require("axios");
const moment = require("moment");
const User = require("../models/user");
const CreditSale = require("../models/credit-sale")

// Admin: Get all Credit Sale
router.get(
  "/all-credit-sales",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      // Ensure the user session and role are valid
      if (req.session.user && req.session.user.role === "administrator") {
        const allCreditSales = await CreditSale.find().sort({ $natural: -1 });

        const formattedCreditSales = allCreditSales.map((creditSale) => {
          const { dispatchDate, dueDate } = creditSale;
          return {
            ...creditSale._doc, // Spread the rest of the Credit Sales data
            formattedDispatchDate: moment(dispatchDate).format("YYYY-MM-DD (h:mm A)"), 
            formattedDueDate: moment(dueDate).format("YYYY-MM-DD (h:mm A)"),
          };
        });

        await axios.post("http://localhost:4500/notifications", {
          title: "Credit Sales List Accessed",
          message: "You have accessed the list of all Credit Sales.",
          notificationType: "success",
        });

        // Render the CreditSales list page for the administrator, with formatted dates
        res.render("administrator/credit-sales-list", {
          creditSales: formattedCreditSales, // Send the formatted data to the view
          activeSidebarLink: "credit-sales",
          loggedInUser: loggedInUser,
        });

      } else {
        // Handle unauthorized access
        res
          .status(403)
          .send("Only Administrators are allowed to access this page!");
      }
    } catch (error) {
      console.error("Error fetching Credit Sales:", error);
      res.status(400).send("Unable to find Credit Sales in your database!");
    }
  }
);

// Admin: Add new credit sale (GET)
router.get("/add-credit-sale", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const loggedInUser = await User.findOne({ _id: req.session.user._id });

    if (req.session.user.role === "administrator") {
      res.render("administrator/add-credit-sale", {
        activeSidebarLink: "credit-sales",
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

// Admin: Add new credit sale (POST)
router.post(
  "/add-credit-sale",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        const newProduce = new Stock(req.body);
        await newProduce.save();

        // Send a notification for credit sale addition
        await axios.post("http://localhost:4500/notifications", {
          title: "Produce Added",
          message: "A new Produce has been successfully added.",
          notificationType: "success",
        });

        res.redirect("/all-credit-sales");
      } else {
        res
          .status(403)
          .send("Only Administrators are allowed to add a produce!");
      }
    } catch (err) {
      console.error("Add Produce error:", err);
      res.status(400).render("administrator/add-credit-sale", {
        error: "Failed to add produce. Please try again.",
      });
    }
  }
);

// Admin: View Credit Sale (GET)
router.get(
  "/view-credit-sale/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      if (req.session.user.role === "administrator") {
        const dbCreditSale = await CreditSale.findOne({ _id: req.params.id });

        // Send a notification for viewing Credit Sale details
        await axios.post("http://localhost:4500/notifications", {
          title: "Credit Sale Details Accessed",
          message: `Credit Sale details for ${dbCreditSale.produceName} have been accessed for veiwing.`,
          notificationType: "success",
        });

        res.render("administrator/credit-sale-details", {
          creditSale: dbCreditSale,
          activeSidebarLink: "credit-sales",
          loggedInUser: loggedInUser,
        });
      } else {
        res
          .status(403)
          .send("Only Administrators are allowed to access this page!");
      }
    } catch (err) {
      console.error("Error fetching credit sale details:", err);
      res.status(400).send("Unable to find credit sale in the database!");
    }
  }
);

// Admin: Update stock (GET)
router.get(
  "/update-credit-sale/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findOne({ _id: req.session.user._id });

      if (req.session.user.role === "administrator") {
        const dbCreditSale = await CreditSale.findOne({ _id: req.params.id });

        // Send a notification for viewing stock details
        await axios.post("http://localhost:4500/notifications", {
          title: "Produce Details Accessed",
          message: `Produce details for ${dbCreditSale.produceName} have been accessed for editing.`,
          notificationType: "success",
        });

        res.render("administrator/update-stock", {
          produce: dbCreditSale,
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
  "/update-credit-sale",
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
  "/delete-credit-sale",
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
