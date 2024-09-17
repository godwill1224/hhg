const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");
const moment = require("moment");
const User = require("../models/user");
const CreditSale = require("../models/credit-sale");
const { sendNotification } = require("../utils/notificationService");

// Common logic to fetch user and sales based on role
const fetchCreditSalesByRole = async (loggedInUser) => {
  let creditSalesQuery = {};

  if (loggedInUser.role === "manager") {
    creditSalesQuery = { dispatchBranch: loggedInUser.branch };
  } else if (loggedInUser.role === "sales-agent") {
    creditSalesQuery = { dispatchedBy: loggedInUser.userName };
  }

  const sortedSales = await CreditSale.find(creditSalesQuery).sort({
    $natural: -1,
  });
  return sortedSales.map((sale) => ({
    ...sale._doc,
    formattedDispatchDate: moment(sale.dispatchDate).format(
      "YYYY-MM-DD (h:mm A)"
    ),
    formattedDueDate: moment(sale.dueDate).format("YYYY-MM-DD (h:mm A)"),
  }));
};

// Get all Credit Sales
router.get(
  "/all-credit-sales",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);
      const formattedCreditSales = await fetchCreditSalesByRole(loggedInUser);

      await sendNotification(
        "Credit Sales List Accessed",
        `You accessed the credit sales list as a ${loggedInUser.role}.`,
        "success"
      );

      res.render(`${loggedInUser.role}/credit-sales-list`, {
        creditSales: formattedCreditSales,
        activeSidebarLink: "credit-sales",
        loggedInUser,
      });
    } catch (error) {
      await sendNotification(
        "Failed To Get All Credit Sales",
        "Unable to fetch credit sales. Please try again.",
        "error"
      );
      res.status(400).redirect("/dashboard");
      console.error("Error fetching credit sales:", error);
    }
  }
);

// Add new credit sale (GET)
router.get(
  "/add-credit-sale",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);

      if (["manager", "sales-agent"].includes(loggedInUser.role)) {
        res.render(`${loggedInUser.role}/add-credit-sale`, {
          activeSidebarLink: "credit-sales",
          loggedInUser,
        });
      } else {
        await sendNotification(
          "Permission Denied",
          "Only managers and sales agents can make a credit sale.",
          "error"
        );
        res.redirect("/all-credit-sales");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Add Credit Sale",
        "Failed to add credit sale record. Please try again.",
        "error"
      );
      res.status(400).render("manager/add-credit-sale");
      console.error("Error adding new credit sale", error);
    }
  }
);

// Add new credit sale (POST)
router.post(
  "/add-credit-sale",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (["manager", "sales-agent"].includes(req.session.user.role)) {
        const newCreditSale = new CreditSale(req.body);
        await newCreditSale.save();

        await sendNotification(
          "Credit Sale Added",
          "A new credit sale has been successfully added.",
          "success"
        );
        res.redirect("/all-credit-sales");
      } else {
        await sendNotification(
          "Permission Denied",
          "Only managers and sales agents can make a credit sale.",
          "error"
        );
        res.redirect("/all-credit-sales");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Add Credit Sale",
        "Failed to add credit sale record. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-credit-sales");
      console.error("Error adding credit sale:", error);
    }
  }
);

// View Credit Sale
router.get(
  "/view-credit-sale/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);
      const dbCreditSale = await CreditSale.findById(req.params.id);

      await sendNotification(
        "Credit Sale Details Accessed",
        `Credit Sale details for ${dbCreditSale.produceName} viewed.`,
        "success"
      );

      res.render(`${loggedInUser.role}/credit-sale-details`, {
        creditSale: dbCreditSale,
        activeSidebarLink: "credit-sales",
        loggedInUser,
      });
    } catch (error) {
      await sendNotification(
        "Failed To View Credit Sale",
        "Failed to view credit sale record. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-credit-sales");
      console.error("Error viewing credit sale:", error);
    }
  }
);

// Update Credit Sale (GET)
router.get(
  "/update-credit-sale/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);
      const dbCreditSale = await CreditSale.findById(req.params.id);
      if (["manager", "sales-agent"].includes(loggedInUser.role)) {
        await sendNotification(
          "Credit Sale Details Accessed",
          `Credit Sale details for ${dbCreditSale.produceName} accessed for editing.`,
          "success"
        );

        res.render(`${loggedInUser.role}/update-credit-sale`, {
          creditSale: dbCreditSale,
          activeSidebarLink: "credit-sales",
          loggedInUser,
        });
      } else {
        await sendNotification(
          "Permission Denied",
          "Only managers and sales agents can edit a credit sale.",
          "error"
        );
        res.redirect("/all-credit-sales");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Edit Credit Sale",
        "Failed to edit credit sale record. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-credit-sales");
      console.error("Error editing credit sale:", error);
    }
  }
);

// Update Credit Sale (POST)
router.post(
  "/update-credit-sale",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (["manager", "sales-agent"].includes(req.session.user.role)) {
        await CreditSale.findByIdAndUpdate(req.query.id, req.body);

        await sendNotification(
          "Credit Sale Updated",
          "Credit sale details updated successfully.",
          "success"
        );
        res.redirect("/all-credit-sales");
      } else {
        await sendNotification(
          "Permission Denied",
          "Only managers and sales agents can edit a credit sale.",
          "error"
        );
        res.redirect("/all-credit-sales");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Edit Credit Sale",
        "Failed to edit credit sale record. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-credit-sales");
      console.error("Error updating credit sale:", error);
    }
  }
);

// Delete Credit Sale
router.post(
  "/delete-credit-sale",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (["manager", "sales-agent"].includes(req.session.user.role)) {
        await CreditSale.deleteOne({ _id: req.body.id });

        await sendNotification(
          "Credit Sale Deleted",
          "A credit sale was deleted successfully.",
          "success"
        );
        res.redirect("/all-credit-sales");
      } else {
        await sendNotification(
          "Permission Denied",
          "Only managers and sales agents can delete a credit sale.",
          "error"
        );
        res.redirect("/all-credit-sales");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Delete Credit Sale",
        "Failed to delete credit sale record. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-credit-sales");
      console.error("Error deleting credit sale:", error);
    }
  }
);

// Generate invoice
router.get(
  "/invoice/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const loggedInUser = await User.findById(req.session.user._id);
      const dbCreditSale = await CreditSale.findById(req.params.id);

      if (["manager", "sales-agent"].includes(loggedInUser.role)) {
        if (!dbCreditSale) {
          await sendNotification(
            "Credit Sale Record Not Found",
            "Failed to find the credit sale record. Please try again.",
            "error"
          );
          res.status(400).redirect("/all-credit-sales");
        }

        res.render(`${loggedInUser.role}/invoice`, {
          creditSale: dbCreditSale,
          activeSidebarLink: "credit-sales",
          loggedInUser,
        });
      } else {
        await sendNotification(
          "Permission Denied",
          "Only managers and sales agents are allowed to generate an invoice.",
          "error"
        );
        res.redirect("/all-sales");
      }
    } catch (error) {
      await sendNotification(
        "Failed To Generate invoice",
        "Unable to generate a credit sale invoice. Please try again.",
        "error"
      );
      res.status(400).redirect("/all-credit-sales");
      console.error("Error generating invoice:", error);
    }
  }
);

module.exports = router;
