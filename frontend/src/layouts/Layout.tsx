import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";
import ScrollAndSocialButtons from "@/components/MediaButton";
function Layout() {
  return (
    <>
      <header className="sticky top-0 z-20">
        <Navbar />
      </header>
      <main className="pt-[88px]">
        <Outlet></Outlet>
        <ScrollAndSocialButtons />
      </main>
      <footer className="mt-24 sm:mt-0">
        <Footer></Footer>
      </footer>
    </>
  );
}
export default Layout;
