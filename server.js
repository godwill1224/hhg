// import required modules
const express = require("express");
const path = require("path");

const app = express(); // create express app
const port = process.env.PORT; // get port from environment variable

app.set("view engine", "pug"); // set the view engine
app.set("views", path.join(__dirname, "views")); // point node to the views directory
app.use(express.static(path.join(__dirname, "public"))); // point node to static files
app.use(express.urlencoded({ extended: false })); // parse urlencoded bodies

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




























// what app.use(express.urlencoded({ extended: false })); does:

// app.use: This is a middleware function in Express.js. Middleware functions are executed sequentially, one after the other. The app.use function adds a middleware to the Express application.

// express.urlencoded(): This middleware is used to parse incoming requests with URL-encoded payloads (typically sent by HTML forms with application/x-www-form-urlencoded encoding). It parses the data and populates the req.body property with the resulting object, making the data available for use in your application.

// { extended: false }: This option determines how the URL-encoded data will be parsed.

// false: This means that the querystring library is used to parse the URL-encoded data, which supports only simple key-value pairs (e.g., key=value).
// true: This means that the qs library is used for parsing, which supports rich objects and arrays (e.g., key[child]=value).