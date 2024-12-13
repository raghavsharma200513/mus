import { assets } from "@/assets/assets";
import Facebook from "@/components/social_icons/Facebook";
import Instagram from "@/components/social_icons/Instagram";
import LanguageContext from "@/context/LanguageContext";
import { useContext } from "react";
import { Link } from "react-router-dom";

type Language = "de" | "en";
type LinkItem = { name: string; link: string };
type LinkList = {
  title: string;
  links: Record<Language, LinkItem[]>;
};

function Footer() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }

  const { language } = context;

  const links: LinkList[] = [
    {
      title: language === "en" ? "Pages" : "Quicklinks",
      links: {
        de: [
          { name: "STARTSEITE", link: "/" },
          { name: "SPEISEKARTE", link: "/menu" },
          { name: "GALERIE", link: "/gallery" },
          { name: "GESCHENKKARTE", link: "/gift-card" },
          { name: "ÜBER UNS", link: "/about-us" },
          { name: "KONTAKT", link: "/contact-us" },
        ],
        en: [
          { name: "Home", link: "/" },
          { name: "Menu", link: "/menu" },
          { name: "Gallery", link: "/gallery" },
          { name: "Gift Card", link: "/gift-card#page-title" },
          { name: "About Us", link: "/about-us" },
          { name: "Contact Us", link: "/contact-us" },
        ],
      },
    },
    {
      title: language === "en" ? "Legal" : "Rechtliche Hinweise",
      links: {
        de: [
          { name: "Datenschutzerklärung", link: "/privacy-policy" },
          { name: "Impressum", link: "/terms" },
        ],
        en: [
          { name: "Privacy Policy", link: "/privacy-policy" },
          { name: "Terms of Conditions", link: "/terms" },
          { name: "Cookies", link: "/cookies" },
        ],
      },
    },
  ];

  return (
    <footer className="bg-primary w-full relative">
      <div
        className="w-full"
        style={{
          aspectRatio: "16/2",
        }}
      ></div>
      <img
        src={assets.footerTB}
        className="absolute top-0 left-0 w-full"
        alt=""
      />
      <div className="border-b pb-6 flex flex-wrap gap-6 justify-between lg:justify-evenly px-6 lg:px-20 mt-10 lg:mt-20 text-white">
        {/* Logo Section */}
        <div className="w-full lg:w-auto text-center lg:text-left">
          <Link
            to="/"
            className="flex justify-center lg:justify-start items-center gap-2"
          >
            <img src={assets.footerLogo} className="w-32" alt="Footer Logo" />
          </Link>
        </div>

        {/* Links Section */}
        {links.map((linkList) => (
          <div
            className="w-full sm:w-1/2 lg:w-auto text-center lg:text-left"
            key={linkList.title}
          >
            <h2 className="font-jost font-semibold text-lg">
              {linkList.title}
            </h2>
            <ul className="space-y-3 mt-3">
              {linkList.links[language as Language].map((link) => (
                <li key={link.link} className="font-jost text-sm">
                  <Link to={link.link}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter Section */}
        <div className="w-full lg:w-1/3 text-center lg:text-left">
          <h2 className="font-jost font-semibold text-lg">
            {language === "en" ? "Subscribe" : "Newsletter abonnieren"}
          </h2>
          <p className="font-jost text-sm mt-3 max-w-full lg:max-w-xs mx-auto lg:mx-0">
            {language === "en"
              ? "Join our newsletter to stay up to date on features and releases."
              : "Melden Sie sich für unseren Newsletter an und verpassen Sie keine kulinarischen Highlights."}
          </p>
        </div>
      </div>

      {/* Copy Text and Social Icons */}
      <div className="flex flex-wrap items-center justify-between gap-6 px-6 lg:px-20 py-7 text-white">
        <p className="font-jost text-center lg:text-left w-full lg:w-auto">
          © 2025 Museum Restaurant
          {language === "en"
            ? "| All rights reserved | Developed by "
            : " | Alle Rechte vorbehalten | Entwickelt von "}
          <b>
            <a
              href="https://www.webmeister360.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              WebMeister360
            </a>
          </b>
        </p>
        <div className="flex justify-center lg:justify-end w-full lg:w-auto gap-3">
          <a
            href="https://www.facebook.com/profile.php?id=61554941725773"
            className="fb block bg-white/20 rounded-full p-2"
            target="_blank"
          >
            <Facebook fill="white" width={20} />
          </a>
          <a
            href="https://www.instagram.com/museum.hechingen/"
            className="inst block bg-white/20 rounded-full p-2"
            target="_blank"
          >
            <Instagram fill="white" width={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
