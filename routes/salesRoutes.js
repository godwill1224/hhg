const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");
const moment = require("moment");
const User = require("../models/user");
const Sale = require("../models/sale");
const { sendNotification } = require("../utils/notificationService");

// Common logic to fetch user and sales based on role
const fetchSalesByRole = async (loggedInUser) => {
  let salesQuery = {};

  if (loggedInUser.role === "manager") {
    salesQuery = { saleBranch: loggedInUser.branch };
  } else if (loggedInUser.role === "sales-agent") {
    salesQuery = { soldBy: loggedInUser._id };
  }

  const sortedSales = await Sale.find(salesQuery).sort({ $natural: -1 });
  return sortedSales.map((sale) => ({
    ...sale._doc,
    formattedDate: moment(sale.dateSold).format("YYYY-MM-DD (h:mm A)"),
  }));
};

// Get all Sales
router.get(
  "/all-sales",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);
      const formattedSales = await fetchSalesByRole(loggedInUser);

      await sendNotification(
        "Sales List Accessed",
        `You have accessed the sales list as a ${loggedInUser.role}.`,
        "success"
      );

      res.render(`${loggedInUser.role}/sales-list`, {
        sales: formattedSales,
        activeSidebarLink: "sales",
        loggedInUser,
      });
    } catch (error) {
      await sendNotification(
        "Failed To Get All Sales",
        "Unable to retrieve sales data. Please try again.",
        "error"
      );
      res.status(400).redirect("/dashboard");
      console.error("Error fetching sales:", error);
    }
  }
);

// Add new sale (GET)
router.get(
  "/add-sale",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);

      if (["manager", "sales-agent"].includes(loggedInUser.role)) {
        res.render(`${loggedInUser.role}/add-sale`, {
          activeSidebarLink: "sales",
          loggedInUser,
        });
      } else {
        await sendNotification(
          "Permission Denied",
          "Only managers and sales agents are allowed to make a sale.",
          "error"
        );
        res.redirect("/all-sales");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Add Sale",
        "Unable to add new sale. Please try again.",
        "error"
      );
      res.status(400).redirect("/dashboard");
      console.error("Error adding sale:", error);
    }
  }
);

// Add new credit sale (POST)
router.post(
  "/add-sale",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (["manager", "sales-agent"].includes(req.session.user.role)) {
        const newSale = new Sale(req.body);
        await newSale.save();

        await sendNotification(
          "Sale Record Added",
          "A new sale has been successfully made.",
          "success"
        );

        res.redirect("/all-sales");
      } else {
        await sendNotification(
          "Permission Denied",
          "Only managers and sales agents are allowed to make a sale.",
          "error"
        );
        res.redirect("/all-sales");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Add Sale",
        "Failed to add new sale record. Please try again.",
        "error"
      );
      res.status(400).redirect("/dashboard");
      console.error("Error adding sale:", error);
    }
  }
);

// View sale details
router.get(
  "/view-sale/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);
      const dbSale = await Sale.findById(req.params.id);

      await sendNotification(
        "Sale Details Accessed",
        `Sale details for ${dbSale.produceName} have been accessed for viewing.`,
        "success"
      );

      res.render(`${loggedInUser.role}/sale-details`, {
        sale: dbSale,
        activeSidebarLink: "sales",
        loggedInUser,
      });
    } catch (error) {
      await sendNotification(
        "Failed To View Sale",
        "Unable to view sale record. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-sales");
      console.error("Error viewing sale:", error);
    }
  }
);

// Update sale
router.get(
  "/update-sale/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);
      const dbSale = await Sale.findById(req.params.id);

      if (["manager", "sales-agent"].includes(loggedInUser.role)) {
        await sendNotification(
          "Sale Details Accessed",
          `Sale details for ${dbSale.produceName} have been accessed for editing.`,
          "success"
        );

        res.render(`${loggedInUser.role}/update-sale`, {
          sale: dbSale,
          activeSidebarLink: "sales",
          loggedInUser,
        });
      } else {
        await sendNotification(
          "Permission Denied",
          "Only managers and sales agents are allowed to edit a sale.",
          "error"
        );
        res.redirect("/all-sales");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Fetch Sale",
        "Unable to fetch sale record. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-sales");
      console.error("Error fetching sale:", error);
    }
  }
);

// Update Sale (POST)
router.post(
  "/update-sale",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (["manager", "sales-agent"].includes(req.session.user.role)) {
        await Sale.findByIdAndUpdate(req.query.id, req.body);

        await sendNotification(
          "Sale Record Updated",
          "Sale details have been successfully updated.",
          "success"
        );
        res.redirect("/all-sales");
      } else {
        await sendNotification(
          "Permission Denied",
          "Only managers and sales agents are allowed to edit a sale.",
          "error"
        );
        res.redirect("/all-sales");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Edit Sale",
        "Unable to edit sale record. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-sales");
      console.error("Error editing sale:", error);
    }
  }
);

// Delete sale record
router.post(
  "/delete-sale",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (["manager", "sales-agent"].includes(req.session.user.role)) {
        await Sale.findByIdAndDelete(req.body.id);

        await sendNotification(
          "Sale Record Deleted",
          "Sale record has been successfully deleted.",
          "success"
        );
        res.redirect("/all-sales");
      } else {
        await sendNotification(
          "Permission Denied",
          "Only managers and sales agents are allowed to delete a sale.",
          "error"
        );
        res.redirect("/all-sales");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Delete Sale",
        "Unable to delete sale record. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-sales");
      console.error("Error deleting sale:", error);
    }
  }
);

// Generate receipt
router.get(
  "/receipt/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);
      const dbSale = await Sale.findById(req.params.id);

      if (["manager", "sales-agent"].includes(loggedInUser.role)) {
        if (!dbSale) {
          await sendNotification(
            "Sale Record Not Found",
            "Failed to find the sale record. Please try again.",
            "error"
          );
          return res.status(400).redirect("/all-sales");
        }
        res.render(`${loggedInUser.role}/receipt`, {
          sale: dbSale,
          activeSidebarLink: "sales",
          loggedInUser,
        });
      } else {
        await sendNotification(
          "Permission Denied",
          "Only managers and sales agents are allowed to generate a sale reciept.",
          "error"
        );
        res.redirect("/all-sales");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Generate Receipt",
        "Unable to generate a sale receipt. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-sales");
      console.error("Error generating receipt:", error);
    }
  }
);

module.exports = router;
