require("dotenv").config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const authController = require("./controllers/auth.js");
const userController = require("./controllers/user.js");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const authRequired = require("./middleware/isUserAuthorized.js");
const passDataToView = require("./middleware/passDataToView.js");

// Connect to MongoDB
require("./db/connection");
// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: true }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));
// Morgan for logging HTTP requests
app.use(morgan("tiny"));
// Set the view engine to EJS
app.set("view engine", "ejs");

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Session expires after 1 day
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  }),
);

// Custom middleware to pass session data to views if the user is logged in
app.use(passDataToView);

// Routes
app.get("/", (req, res) => {
  res.render("index.ejs", {
    user: req.session.user,
  });
});

app.use("/auth", authController);

// Any routes that come after this middleware will require the user to be authenticated
app.use(authRequired);
app.use("/users", userController);

app.listen(PORT, () => {
  console.log(`The port is running on: ${PORT}!`);
});
