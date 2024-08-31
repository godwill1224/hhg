const express = require("express");
const router = express.Router();
const connectEnsureLogin = require("connect-ensure-login");

const Branch = require("../models/branchModel");

// admin all branches
router.get(
  "/all-branches",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        const allbranch = await branch.find().sort({ $natural: -1 });
        res.render("administrator/branch-list", {
          branch: allbranch,
        });
      } else {
        res.send("Only Administrators are allowed to access this page!");
      }
    } catch (error) {
      res.status(400).send("Unable to find branches in your database!");
    }
  }
);

// admin add new branch
router.get("/add-branch", connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  if (req.session.user.role === "administrator") {
    res.render("administrator/add-branch");
  } else {
    res.send("Only Administrators are allowed to access this page!");
  }
});

router.post(
  "/add-branch",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        const newBranch = Branch(req.body);
        await newBranch.save();
        res.redirect("/all-branches");
      } else {
        res.send("Only Administrators are allowed to add a branch!");
      }
    } catch (err) {
      res.status(400).render("administrator/add-branch");
      console.log("Add branch error", err);
    }
  }
);

// admin update branch
router.get(
  "/update-branch/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        const dbbranch = await Branch.findOne({ _id: req.params.id });
        res.render("administrator/update-branch", {
          branchItem: dbbranch,
        });
      } else {
        res.send("Only Administrators are allowed to access this page!");
      }
    } catch (err) {
      res.status(400).send("Unable to find user in the database!");
    }
  }
);

router.post(
  "/update-branch",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      if (req.session.user.role === "administrator") {
        await Branch.findOneAndUpdate({ _id: req.query.id }, req.body);
        res.redirect("/all-branches");
      } else {
        res.send("Only Administrators are allowed to update a branch!");
      }
    } catch (err) {
      res.status(400).send("Unable to update branch in the database!");
    }
  }
);

// admin delete branch
router.post("/delete-branch", async (req, res) => {
  try {
    if (req.session.user.role === "administrator") {
      await Branch.deleteOne({ _id: req.body.id });
      res.redirect("back");
    } else {
      res.send("Only Administrators are allowed to delete a branch!");
    }
  } catch (err) {
    res.status(400).send("Unable to delete branch in the database!");
  }
});

module.exports = router;
