import { assets } from "@/assets/assets";
import Facebook from "@/components/social_icons/Facebook";
import Instagram from "@/components/social_icons/Instagram";
import LanguageContext from "@/context/LanguageContext";
import axios from "axios";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";

type Language = "de" | "en";
type LinkItem = { name: string; link: string };
type LinkList = {
  title: string;
  links: Record<Language, LinkItem[]>;
};

function Footer() {
  const context = useContext(LanguageContext);
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }

  const { language } = context;

  const links: LinkList[] = [
    {
      title: language === "en" ? "Quick Links" : "Quicklinks",
      links: {
        de: [
          { name: "Startseite", link: "/" },
          { name: "Speisekarte", link: "/menu" },
          { name: "Galerie", link: "/gallery" },
          { name: "Geschenkkarte", link: "/gift-card" },
          { name: "Über Uns", link: "/about-us" },
          { name: "Kontakt", link: "/contact-us" },
        ],
        en: [
          { name: "Home", link: "/" },
          { name: "Menu", link: "/menu" },
          { name: "Gallery", link: "/gallery" },
          { name: "Gift Card", link: "/gift-card" },
          { name: "About Us", link: "/about-us" },
          { name: "Contact Us", link: "/contact-us" },
        ],
      },
    },
    {
      title: language === "en" ? "Legal" : "Rechtliche Hinweise",
      links: {
        de: [
          { name: "Datenschutzerklärung", link: "policy?type=privacy_policy" },
          { name: "Impressum", link: "policy?type=terms_and_conditions" },
          // { name: "Cookies", link: "/cookies" },
        ],
        en: [
          { name: "Privacy Policy", link: "policy?type=privacy_policy" },
          {
            name: "Terms of Conditions",
            link: "policy?type=terms_and_conditions",
          },
          // { name: "Cookies", link: "/cookies" },
        ],
      },
    },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    console.log(email);

    try {
      // Add your subscription API call here
      await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/newsletter/subscribe",
        {
          email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSubscribeStatus("success");
      // setEmail("");
      setTimeout(() => setSubscribeStatus("idle"), 3000);
    } catch (error) {
      console.log(error);
      setSubscribeStatus("error");
      setTimeout(() => setSubscribeStatus("idle"), 3000);
    }
  };

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
            {language === "en"
              ? "Subscribe to Newsletter"
              : "Newsletter abonnieren"}
          </h2>
          <p className="font-jost text-sm mt-3 max-w-full lg:max-w-xs mx-auto lg:mx-0">
            {language === "en"
              ? "Sign up for our newsletter and don’t miss any culinary highlights!"
              : "Melden Sie sich für unseren Newsletter an und verpassen Sie keine kulinarischen Highlights."}
          </p>
          <form onSubmit={handleSubscribe} className="mt-4 relative">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  language === "en" ? "Enter your email" : "E-Mail eingeben"
                }
                className="flex-1 px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-white text-primary rounded-md hover:bg-white/90 transition-colors font-jost"
              >
                {language === "en" ? "Subscribe" : "Abonnieren"}
              </button>
            </div>
            {subscribeStatus === "success" && (
              <p className="absolute mt-1 text-sm text-green-400">
                {language === "en"
                  ? "Successfully subscribed!"
                  : "Erfolgreich abonniert!"}
              </p>
            )}
            {subscribeStatus === "error" && (
              <p className="absolute mt-1 text-sm text-red-400">
                {language === "en"
                  ? "Subscription failed. Please try again."
                  : "Abonnement fehlgeschlagen. Bitte versuchen Sie es erneut."}
              </p>
            )}
          </form>
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
