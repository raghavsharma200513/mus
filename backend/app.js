const express = require("express");
var { rainbow } = require("handy-log");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const AdminRoutes = require("./admin-routes");
const AppRoutes = require("./app-routes");
const createAdmin = require("./config/createAdmin");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const path = require("path");

// create admin
const result = createAdmin();
if (!result) {
  print("admin creation failed");
  process.exit();
}

//express and env config
const app = express(),
  {
    env: { DB_CONNECT, PORT },
  } = process;

//mongodb connection
mongoose.connect(DB_CONNECT, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
mongoose.connection.on("connected", () => {
  console.log("Connected to mongo instance");
});
mongoose.connection.on("error", (err) => {
  console.error("Error connecting to mongo", err);
});

sessionStore = new MongoStore({
  url: DB_CONNECT,
});

// Use the session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 14 * 24 * 60 * 60, // = 14 days. Default
    },
  })
);

//middleware
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

//routes
AdminRoutes(app);
AppRoutes(app);

module.exports = app;
