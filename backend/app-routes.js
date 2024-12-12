const bookingRoutes = require("./routes/app/bookingRoutes");
const orderRoutes = require("./routes/app/orderRoutes");
const menuRoutes = require("./routes/app/menuRoutes");
const cartRoutes = require("./routes/app/cartRoutes");
const checkoutRoutes = require("./routes/app/checkoutRoutes");
const categoryRoute = require("./routes/app/categoryRoute");
const authRoutes = require("./routes/app/authRoutes");
const discountRoutes = require("./routes/app/discountRoutes");
const addressRoutes = require("./routes/app/addressRoutes");
const reservationRoutes = require("./routes/app/reservationRoutes");
const galleryRoutes = require("./routes/app/galleryRoutes");
const messageRoutes = require("./routes/app/messageRoutes");

const AppRoutes = (app) => {
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/menu", menuRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/checkout", checkoutRoutes);
  app.use("/api/category", categoryRoute);
  app.use("/api/discount", discountRoutes);
  app.use("/api/address", addressRoutes);
  app.use("/api/reservation", reservationRoutes);
  app.use("/api/gallery", galleryRoutes);
  app.use("/api/message", messageRoutes);
};

module.exports = AppRoutes;
