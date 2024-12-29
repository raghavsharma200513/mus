import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";
import ScrollAndSocialButtons from "@/components/MediaButton";
// import CookieConsent from "@/components/CookieConsent";

function Layout() {
  return (
    <>
      <header className="fixed top-0 left-0 w-full z-20">
        <Navbar />
      </header>
      <main className="pt-[88px]">
        <Outlet></Outlet>
        <ScrollAndSocialButtons />
        {/* <CookieConsent /> */}
      </main>
      <footer className="mt-40 sm:mt-0">
        <Footer></Footer>
      </footer>
    </>
  );
}
export default Layout;
