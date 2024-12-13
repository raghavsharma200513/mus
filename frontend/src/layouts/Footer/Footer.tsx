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
      <img src={assets.footerTB} className="absolute top-0 left-0" alt="" />
      <div className="border-b bottom-1 pb-6 flex justify-between flex-wrap mx-20 mt-20 text-white">
        <div className="logoContainer">
          <Link to="/" className="flex align-middle items-center gap-2">
            <img src={assets.footerLogo} className="w-32" alt="Footer Logo" />
          </Link>
        </div>

        {links.map((linkList) => (
          <div className="linkTable" key={linkList.title}>
            <h2 className="font-jost font-semibold">{linkList.title}</h2>
            <ul className="space-y-3 mt-3">
              {linkList.links[language as Language].map((link) => (
                <li key={link.link} className="font-jost text-sm">
                  <Link to={link.link}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="newsLetter">
          <h2 className="font-jost font-semibold">
            {language === "en" ? "Subscribe" : "Newsletter abonnieren"}
          </h2>
          <p className="font-jost text-sm max-w-72 mt-3">
            {language === "en"
              ? "Join our newsletter to stay up to date on features and releases."
              : "Melden Sie sich für unseren Newsletter an und verpassen Sie keine kulinarischen Highlights."}
          </p>
        </div>
      </div>

      <div className="copyText mx-20 flex justify-between py-7 text-white">
        <p className="font-jost">
          © 2025 Museum Restaurant
          {language === "en"
            ? "| All rights reserved | Developed by"
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
        <div className="socials-footer flex gap-3">
          <a
            href="https://www.facebook.com/profile.php?id=61554941725773"
            className="fb block bg-white/20 rounded-full p-2"
          >
            <Facebook fill="white" width={20} />
          </a>
          <a
            href="https://www.instagram.com/museum.hechingen/"
            className="inst block bg-white/20 rounded-full p-2"
          >
            <Instagram fill="white" width={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
