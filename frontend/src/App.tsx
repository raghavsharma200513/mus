import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import Menu from "./pages/Menu/Menu";
import Cart from "./pages/cart/Cart.tsx";
import Review from "./pages/cart/Review.tsx";
import Gallery from "./pages/Gallery/Gallery";
import AboutUs from "./pages/AboutUs/AboutUs";
import Login from "./pages/Auth/Login.tsx";
import AddAddress from "./pages/AddAddress/AddAddress.tsx";
import Register from "./pages/Auth/RegisterPage.tsx";
import ContactUs from "./pages/ContactUs/ContactUs";
import Orders from "./pages/orders/order.tsx";
import GiftCard from "./pages/GiftCard/GiftCard";
import GiftCardConfirm from "./pages/GiftCard/GiftCardConfirm.tsx";
import Confirm from "./pages/confirm/Confirm.tsx";
import Layout from "./layouts/Layout";
import AdminLayout from "./pages/admin/Admin.tsx";
import AdminOrder from "./pages/admin/Orders.tsx";
import PendingOrder from "./pages/admin/PendingOrder.tsx";
import AcceptedOrders from "./pages/admin/AcceptedOrders.js";
import CanceledOrders from "./pages/admin/Canceledorders.tsx";
import Confirmedorders from "./pages/admin/Confirmedorders.tsx";
import Discount from "./pages/admin/Discount.tsx";
import AdminMenu from "./pages/admin/Menu.tsx";
import Message from "./pages/admin/Message.tsx";
import Category from "./pages/admin/Category.tsx";
import Pendingreservation from "./pages/admin/pendingreservation.tsx";
import Cancelledreservation from "./pages/admin/cancelledreservation.tsx";
import Confirmendreservation from "./pages/admin/confirmendreservation.tsx";
import BannerManagement from "./pages/admin/BannerManagement.tsx";
import AdminGallery from "./pages/admin/Gallery.tsx";
import Reservation from "./pages/admin/reservation.tsx";
import "./App.css";
import "@mantine/core/styles.css";
import ScrollToTop from "./components/ScrollToTop.tsx";

import { MantineProvider } from "@mantine/core";

function App() {
  return (
    <MantineProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Routes that use the Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="menu" element={<Menu />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="gift-card" element={<GiftCard />} />
            <Route
              path="gift-card-confirmation"
              element={<GiftCardConfirm />}
            />
            <Route path="about-us" element={<AboutUs />} />
            <Route path="contact-us" element={<ContactUs />} />
            <Route path="cart" element={<Cart />} />
            <Route path="review" element={<Review />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="add-address" element={<AddAddress />} />
            <Route path="order-confirmation" element={<Confirm />} />
            <Route path="orders" element={<Orders />} />
          </Route>

          {/* Route that does not use the Layout */}
          <Route path="adminnavbar" element={<AdminLayout />}>
            <Route index element={<PendingOrder />} />
            <Route path="orders" element={<AdminOrder />} />
            <Route path="acceptedorders" element={<AcceptedOrders />} />
            <Route path="confirmedorders" element={<Confirmedorders />} />
            <Route path="canceledorders" element={<CanceledOrders />} />
            <Route path="discount" element={<Discount />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="message" element={<Message />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="category" element={<Category />} />
            <Route path="banner" element={<BannerManagement />} />
            <Route path="reservation" element={<Reservation />} />
            <Route path="pendingreservation" element={<Pendingreservation />} />
            <Route
              path="confirmendreservation"
              element={<Confirmendreservation />}
            />
            <Route
              path="cancelledreservation"
              element={<Cancelledreservation />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
