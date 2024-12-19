import { assets } from "@/assets/assets";
import ContactForm from "../Home/ContactForm";
import Facebook from "@/components/social_icons/Facebook";
import Instagram from "@/components/social_icons/Instagram";
import ContactDetailsBG from "@/components/ContactDetailsBG";
import LanguageContext from "@/context/LanguageContext";
import { useContext } from "react";

function ContactUs() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }
  const { language } = context;
  const details = [
    {
      title: language == "en" ? "Opening Hours" : "Öffnungszeiten",
      content:
        language == "en"
          ? "Monday: Closed<br>Tuesday - Friday:10:30–14:00,<br>16:30–23:00<br>Saturday: 12:00–23:00<br>Sunday: 12:00–23:00"
          : "Montag: Geschlossen<br>Dienstag – Freitag: 10:30 – 14:00,<br>16:30 – 23:00<br>Samstag: 12:00 – 23:00<br>Sonntag: 12:00 – 23:00",
    },
    {
      title: language == "en" ? "Address" : "Adresse",
      content:
        language == "en"
          ? 'Zollernstraße 2, 72379 Hechingen, Germany<br><br><a href="https://maps.app.goo.gl/cNTSeoC9ty3zwacg6" target="_blank" className="underline">Check Location</a>'
          : 'Zollernstraße 2,72379 Hechingen, Deutschland<br><br><a href="https://maps.app.goo.gl/cNTSeoC9ty3zwacg6" target="_blank" className="underline">Standort anzeigen!</a>',
    },
    {
      title: language == "en" ? "Get In Touch" : "Unsere Kontaktdaten",
      content:
        language == "en"
          ? "Telephone: +49 7471 13015<br>Email: abc@gmail.com<br><br>Contact Us"
          : "Telefon: +49 7471 13015<br>E-Mail: abc@gmail.com<br><br>Kontakt aufnehmen!",
    },
  ];

  return (
    <main className="w-full" id="contact">
      <div className="page-title text-center py-8 bg-gray-100">
        <h1 className="text-3xl md:text-4xl font-bold">
          {language == "en" ? "Contact Us" : "Kontakt"}
        </h1>
        <h2 className="text-sm text-gray-600 mt-2">{language == "en" ? "HOME / CONTACT US" : "STARTSEITE / KONTAKT"}</h2>
      </div>

      {/* Message Section */}
      <section className="relative my-8 md:my-12 mx-4 md:mx-20 bg-primary overflow-hidden py-12 rounded-lg">
        <h1 className="font-jost font-semibold text-white text-2xl md:text-3xl mx-auto mb-8 text-center">
          {language == "en" ? "Send Us A Message" : "Send Us A Message"}
        </h1>

        {/* Decorative Images - Adjusted for responsiveness */}
        <img
          src={assets.elephantImg}
          className="hidden md:block absolute bottom-0 left-0 translate-x-[-50%] h-3/4"
          alt=""
        />
        <img
          src={assets.elephantImg}
          className="hidden md:block absolute bottom-0 right-0 translate-x-[50%] h-3/4"
          alt=""
        />
        <img
          src={assets.mandalWhite}
          alt=""
          className="absolute top-[50%] h-full translate-y-[-50%] left-[50%] translate-x-[-50%] opacity-20 md:opacity-100"
        />

        <div className="max-w-screen-sm relative z-10 mx-4 md:mx-auto">
          <ContactForm btnPrimary={false} color="slate-50"></ContactForm>
        </div>
      </section>

      {/* Video and Map Section */}
      <section className="flex flex-col md:flex-row relative my-8 md:my-12 gap-4 md:gap-10 mx-4 md:mx-20">
        <div className="relative overflow-hidden aspect-video md:aspect-square basis-full md:basis-1/2 mb-4 md:mb-0">
          <video
            src={assets.contactUs}
            autoPlay
            playsInline
            muted
            loop
            preload="auto"
            disablePictureInPicture
            className="absolute object-cover w-full h-full locGif"
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
              display: "block",
            }}
          ></video>
        </div>
        <div className="map basis-full md:basis-1/2 h-[300px] md:h-auto">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2651.559532861968!2d8.960021176474669!3d48.34977107126759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479a025caee3deef%3A0x48134b05d76cf695!2sMuseum%20Restaurant!5e0!3m2!1sen!2sin!4v1730740243911!5m2!1sen!2sin"
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>

      {/* Social Links Section */}
      <section className="socialLinks my-8 md:my-12 font-jost text-[--primary-color] text-center">
        <p className="font-semibold text-base md:text-xl mb-4">
          {language == "en"
            ? "Follow Our Social Media:"
            : "Folgen Sie uns auf Social Media für die neuesten Highlights:"}
        </p>
        <div className="socials-footer flex justify-center gap-3">
          <a
            href="https://www.facebook.com/profile.php?id=61554941725773"
            className="block bg-primary/20 rounded-full p-2"
            target="_blank"
          >
            <Facebook fill="hsl(var(--primary))" width={20}></Facebook>
          </a>
          <a
            href="https://www.instagram.com/museum.hechingen/"
            className="block bg-primary/20 rounded-full p-2"
            target="_blank"
          >
            <Instagram fill="hsl(var(--primary))" width={20}></Instagram>
          </a>
        </div>
      </section>

      {/* Contact Details Section */}
      <section className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-[6vw] mx-4 md:mx-20 mb-12">
        {details.map(({ title, content }, index) => (
          <div key={index} className="flex-1">
            <ContactDetailsBG title={title} content={content} />
          </div>
        ))}
      </section>
    </main>
  );
}

export default ContactUs;
