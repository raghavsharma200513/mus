import { Link, NavLink } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { useContext, useEffect, useState } from "react";
import LanguageContext from "@/context/LanguageContext";
import { useDispatch } from "react-redux";
import { CircleUser, ShoppingCart, Menu, X } from "lucide-react";

interface Link {
  name: string;
  link: string;
}

interface Links {
  de: Link[];
  en: Link[];
}

interface LanguageContextType {
  language: "en" | "de";
  changeLanguage: (lang: "en" | "de") => void;
  bannerSeen: boolean;
  setBannerSeen: (seen: boolean) => void;
}

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const [transparent, setTransparent] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleScroll = () => {
    setTransparent(window.scrollY > 100);
  };

  const context = useContext<LanguageContextType | null>(LanguageContext);

  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }

  const { language, changeLanguage } = context;

  const handleLanguageChange = (value: "en" | "de") => {
    changeLanguage(value);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [dispatch]);

  const links: Links = {
    de: [
      { name: "STARTSEITE", link: "/" },
      { name: "SPEISEKARTE", link: "/menu" },
      { name: "GALERIE", link: "/gallery" },
      { name: "GESCHENKKARTE", link: "/gift-card#page-title" },
      { name: "ÜBER UNS", link: "/about-us" },
      { name: "KONTAKT", link: "/contact-us#contact" },
    ],
    en: [
      { name: "HOME", link: "/" },
      { name: "MENU", link: "/menu" },
      { name: "GALLERY", link: "/gallery" },
      { name: "GIFT CARD", link: "/gift-card#page-title" },
      { name: "ABOUT US", link: "/about-us" },
      { name: "CONTACT US", link: "/contact-us#contact" },
    ],
  };

  return (
    <nav
      className={`bg-primary transition-colors duration-500 fixed w-full z-50 mb-5 ${
        transparent ? "bg-primary/90" : ""
      }`}
    >
      <div className="max-w-screen-xl m-auto py-5 px-4 flex items-center justify-between relative">
        {/* Logo */}
        <Link to="/" className="flex align-middle items-center gap-2">
          <img src={assets.logo} className="w-14" alt="Logo" />
          <h1 className="text-white text-xl font-semibold">
            MUSEUM RESTAURANT
          </h1>
        </Link>

        {/* Desktop Navigation Menu */}
        <div className="hidden lg:flex nav-menu text-white gap-8 font-jost font-normal text-sm">
          {links[language].map((link, index) => (
            <NavLink
              key={index}
              to={link.link}
              className={({ isActive }) => (isActive ? "text-secondary" : "")}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Right Side Navigation */}
        <div className="nav-right flex items-center gap-4">
          {/* Language Selector */}
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-100 text-white hidden lg:flex">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-primary text-white">
              <SelectItem
                value="en"
                className="focus:bg-[--tertiary-color] focus:text-white hover:bg-[--tertiary-color] hover:text-white"
              >
                <div className="flex gap-2 items-center">
                  <img src={assets.enFlag} width="20px" alt="English flag" />
                  <span>EN</span>
                </div>
              </SelectItem>
              <SelectItem
                value="de"
                className="focus:bg-[--tertiary-color] focus:text-white hover:bg-[--tertiary-color] hover:text-white"
              >
                <div className="flex gap-2 items-center">
                  <img src={assets.deFlag} width="20px" alt="German flag" />
                  <span>DE</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* User/Login Actions */}
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link
                to="orders"
                className="cartIcon cursor-pointer transform hover:translate-y-[-4px] transition-all duration-500 hidden lg:block"
              >
                <CircleUser color="#ffffff" />
              </Link>
              <Link
                to="/cart"
                className="login flex gap-1 text-white bg-secondary items-center place-content-center content-center font-jost py-3 px-4 rounded hover:bg-secondary/80 transition-color duration-500"
              >
                <ShoppingCart />
                <span className="hidden lg:inline">
                  {language === "en" ? "Cart" : "Warenkorb"}
                </span>
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="login flex gap-1 text-white bg-secondary items-center place-content-center content-center font-jost py-3 px-4 rounded hover:bg-secondary/80 transition-color duration-500"
            >
              <img src={assets.person} alt="Person icon" />
              <span className="hidden md:inline">
                {language === "en" ? "Login" : "Anmelden"}
              </span>
            </Link>
          )}

          <button className="lg:hidden text-white" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-primary z-40 md:hidden"
          onClick={closeMobileMenu}
        >
          <div
            className="flex flex-col items-center justify-center h-full gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Navigation Links */}
            {links[language].map((link, index) => (
              <NavLink
                key={index}
                to={link.link}
                className="text-white text-2xl"
                onClick={closeMobileMenu}
              >
                {link.name}
              </NavLink>
            ))}

            {/* Mobile Language Selector */}
            <Select
              value={language}
              onValueChange={(value: "en" | "de") => {
                handleLanguageChange(value);
                closeMobileMenu();
              }}
            >
              <SelectTrigger className="w-[180px] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-primary text-white">
                <SelectItem
                  value="en"
                  className="focus:bg-[--tertiary-color] focus:text-white hover:bg-[--tertiary-color] hover:text-white"
                >
                  <div className="flex gap-2 items-center">
                    <img src={assets.enFlag} width="20px" alt="English flag" />
                    <span>English</span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="de"
                  className="focus:bg-[--tertiary-color] focus:text-white hover:bg-[--tertiary-color] hover:text-white"
                >
                  <div className="flex gap-2 items-center">
                    <img src={assets.deFlag} width="20px" alt="German flag" />
                    <span>Deutsch</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile User/Login Actions */}
            {isLoggedIn ? (
              <div className="flex flex-col items-center gap-4">
                <Link
                  to="orders"
                  className="text-white text-2xl"
                  onClick={closeMobileMenu}
                >
                  {language === "en" ? "My Orders" : "Meine Bestellungen"}
                </Link>
                <Link
                  to="/cart"
                  className="login flex gap-1 text-white bg-secondary items-center place-content-center content-center font-jost py-3 px-4 rounded hover:bg-secondary/80 transition-color duration-500"
                  onClick={closeMobileMenu}
                >
                  <ShoppingCart />
                  <span>{language === "en" ? "Cart" : "Warenkorb"}</span>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="login flex gap-1 text-white bg-secondary items-center place-content-center content-center font-jost py-3 px-4 rounded hover:bg-secondary/80 transition-color duration-500"
                onClick={closeMobileMenu}
              >
                <img src={assets.person} alt="Person icon" />
                <span>{language === "en" ? "Login" : "Anmelden"}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
