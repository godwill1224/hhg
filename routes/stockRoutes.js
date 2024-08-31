const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");

const Stock = require("../models/stock");

// Add New Stock
router.get("/add-stock-page", (req, res) => {
  res.render("add-stock");
});

router.post("/add-stock-page", async (req, res) => {
  try {
    const newProduce = Stock(req.body);
    await newProduce.save();
    res.redirect("/all-stock-page");
  } catch (err) {
    res.status(400).render("add-stock");
    console.log("Add Stock error", err);
  }
});

// all stock
router.get(
  "/all-stock-page",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "manager") {
        // ensure that only managers access all-users page
        const allStock = await Stock.find().sort({ $natural: -1 });
        res.render("stock-list", {
          stock: allStock,
        });
      } else {
        res.send("Only Managers are allowed to access this page");
      }
    } catch (error) {
      res.status(400).send("Unable to find stock in your database", error);
    }
  }
);

// update stock
router.get("/update-stock-page/:id", async (req, res) => {
  try {
    const dbStock = await Stock.findOne({ _id: req.params.id });
    res.render("update-stock", {
      stockItem: dbStock,
    });
  } catch (err) {
    res.status(400).send("Unable to find user in the database");
  }
});

router.post("/update-stock-page", async (req, res) => {
  try {
    await Stock.findOneAndUpdate({ _id: req.query.id }, req.body);
    res.redirect("/all-stock-page");
  } catch (err) {
    res.status(404).send("Unable to update stock in the database");
  }
});

// delete stock
router.post("/delete-stock", async (req, res) => {
  try {
    await Stock.deleteOne({ _id: req.body.id });
    res.redirect("back");
  } catch (err) {
    res.status(400).send("Unable to delete stock in the database");
  }
});

module.exports = router;
