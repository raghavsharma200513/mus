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
import { CircleUser, ShoppingCart } from "lucide-react";

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
}

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const [transparent, setTransparent] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleScroll = () => {
    if (window.scrollY > 100) {
      setTransparent(true);
    } else {
      setTransparent(false);
    }
  };

  const context = useContext<LanguageContextType | null>(LanguageContext);

  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }

  const { language, changeLanguage } = context;

  const handleLanguageChange = (value: "en" | "de") => {
    changeLanguage(value);
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
      { name: "KONTAKT", link: "/contact-us" },
    ],
    en: [
      { name: "HOME", link: "/" },
      { name: "MENU", link: "/menu" },
      { name: "GALLERY", link: "/gallery" },
      { name: "GIFT CARD", link: "/gift-card#page-title" },
      { name: "ABOUT US", link: "/about-us" },
      { name: "CONTACT US", link: "/contact-us" },
    ],
  };

  return (
    <nav
      className={`bg-primary transition-colors duration-500 ${
        transparent ? "bg-primary/90" : ""
      }`}
    >
      <div className="max-w-screen-xl m-auto py-5 flex items-center justify-between">
        <Link to="/" className="flex align-middle items-center gap-2">
          <img src={assets.logo} className="w-14" alt="Logo" />
        </Link>

        <div className="nav-menu text-white flex gap-8 font-jost font-normal text-sm">
          {links[language].map((link, index) => (
            <NavLink key={index} to={link.link}>
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="nav-right flex items-center gap-4">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-100 text-white">
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

          {isLoggedIn && (
            <Link
              to="orders"
              className="cartIcon cursor-pointer transform hover:translate-y-[-4px] transition-all duration-500"
            >
              <CircleUser color="#ffffff" />
            </Link>
          )}

          {!isLoggedIn ? (
            <Link
              to="/login"
              className="login flex gap-1 text-white bg-secondary items-center place-content-center content-center font-jost py-3 px-4 rounded hover:bg-secondary/80 transition-color duration-500"
            >
              <img src={assets.person} alt="Person icon" />
              <span>{language === "en" ? "Login" : "Anmelden"}</span>
            </Link>
          ) : (
            <Link
              to="/cart"
              className="login flex gap-1 text-white bg-secondary items-center place-content-center content-center font-jost py-3 px-4 rounded hover:bg-secondary/80 transition-color duration-500"
            >
              <ShoppingCart />
              <span>{language === "en" ? "Cart" : "Warenkorb"}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
