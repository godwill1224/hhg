// dependencies
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const moment = require("moment");
const http = require("http"); // Create the HTTP server

// sessions
const expressSession = require("express-session")({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
});

require("dotenv").config();

// instantiations
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000; // Use environment port or default to 4000

// import models
const User = require("./models/user");

// importing routes
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const branchRoutes = require("./routes/branchRoutes");
const authRoutes = require("./routes/authRoutes");
const pageRoutes = require("./routes/pageRoutes");
const stockRoutes = require("./routes/stockRoutes");
const salesRoutes = require("./routes/salesRoutes");
const creditSalesRoutes = require("./routes/creditSalesRoutes");

// configurations
mongoose.connect(process.env.DATABASE_LOCAL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection
  .once("open", () => {
    console.log("Mongoose connection open");
  })
  .on("error", (err) => {
    console.error(`Connection error: ${err.message}`);
  });

// set view engine to pug
app.locals.moment = moment;
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serve static files from 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// express session configs
app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());

// passport configs
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// use imported routes
app.use("/", notificationRoutes);
app.use("/", userRoutes);
app.use("/", branchRoutes);
app.use("/", authRoutes);
app.use("/", pageRoutes);
app.use("/", stockRoutes);
app.use("/", salesRoutes);
app.use("/", creditSalesRoutes);

// handle 404 errors
app.get("*", (req, res) => {
  res.status(404).render("not-found");
});

// start the server
server.listen(port, () => console.log(`Listening on port ${port}`));
