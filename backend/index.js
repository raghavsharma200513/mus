const express = require("express");
const { rainbow } = require("handy-log");
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
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Models
// const MenuItem = require("./models/MenuItem"); // Adjust the path as needed

// Ensure images directory exists
const imageDir = path.join(__dirname, "images");
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// Image Upload Middleware
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageDir);
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).single("image");

// Image Controller
const imageController = {
  uploadImage: (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }
      res.status(200).json({
        message: "Image uploaded successfully",
        filename: req.file.filename,
        path: `/images/${req.file.filename}`,
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ error: "Image upload failed" });
    }
  },

  createMenuItem: async (req, res) => {
    try {
      const {
        name,
        actualPrice,
        discountedPrice,
        description,
        category,
        addOns,
        variants,
      } = req.body;

      if (!name || !actualPrice || !category) {
        return res
          .status(400)
          .json({ error: "Name, price and category are required" });
      }

      // Parse the JSON strings into objects
      const parsedAddOns = JSON.parse(addOns || "[]");
      const parsedVariants = JSON.parse(variants || "[]");

      const menuItem = new MenuItem({
        name,
        actualPrice,
        discountedPrice,
        description,
        category,
        addOns: parsedAddOns,
        variants: parsedVariants,
        image: req.file ? `/images/${req.file.filename}` : null,
      });

      await menuItem.save();

      res.status(201).json({
        message: "Menu item created successfully",
        menuItem,
      });
    } catch (error) {
      console.error("Menu item creation error:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

// Create admin
const result = createAdmin();
if (!result) {
  console.log("admin creation failed");
  process.exit();
}

// Express and environment config
const app = express();
const {
  env: { DB_CONNECT, PORT },
} = process;

// MongoDB connection
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

// Session store
const sessionStore = new MongoStore({
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
      maxAge: 14 * 24 * 60 * 60, // = 14 days
    },
  })
);

// Middleware
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
AdminRoutes(app);
AppRoutes(app);

// Add image upload route
app.post("/api/upload", upload, imageController.uploadImage);

// Create HTTP server
const server = http.createServer(app);

// Socket.io
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("socket connected");
  socket.on("disconnect", function () {
    console.log("socket disconnected!");
  });
  app.socket = socket;
});

// Start server
server.listen(PORT, () => {
  console.log("\x1b[36m%s\x1b[0m", `url: http://localhost:${PORT}`);
});

module.exports = app;
