import { assets } from "@/assets/assets";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import ReserveTableForm from "./ReserveTableForm";
import StarRating from "./StarRating";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ContactForm from "./ContactForm";
import { useContext, useEffect, useState } from "react";
import LanguageContext from "@/context/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "../../components/Modal";
import { X } from "lucide-react";

interface DiscoverData {
  img: string;
  title: string;
  desc: string;
}

interface DiscoverSection {
  [language: string]: DiscoverData[];
}

interface Banner {
  imageUrl: string;
  title: string;
  description?: string;
}

// interface CarouselProps {
//   language: string;
// }

const Home = () => {
  const navigate = useNavigate();
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }
  const { language, bannerSeen, setBannerSeen } = context;
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const { data } = await axios.get(
          import.meta.env.VITE_BACKEND_URL + "/api/banner/enable"
        );
        console.log(data.data);

        // Find the first enabled banner
        const activeBanner = data.data;

        if (activeBanner) {
          setBanner(activeBanner);
          setIsBannerOpen(bannerSeen);
        }
      } catch (error) {
        console.error("Error fetching banner:", error);
      }
    };

    fetchBanner();
  }, []);

  const showcaseSection = {
    en: {
      title: "Museum Restaurant",
      desc: "A Taste of Royalty with Majestic Flavors of India – Where Tradition Meets Elegance.",
    },
    de: {
      title: "Museum Restaurant",
      desc: "Ein Geschmack von Königlichkeit mit majestätischen Aromen Indiens – Wo Tradition auf Eleganz trifft",
    },
  };

  const discoverSection: DiscoverSection = {
    de: [
      {
        img: assets.disc1img,
        title: "Burg Hohenzollern",
        desc: "Entdecken Sie die Majestät der Burg, ein Symbol königlicher Geschichte und Eleganz, nur 7 Minuten Autofahrt entfernt.",
      },
      {
        img: assets.disc2img,
        title: "Museum Restaurant",
        desc: "Speisen Sie wie Könige mit traditioneller indischer Küche im Herzen von Hechingens Charme.",
      },
      {
        img: assets.disc3img,
        title: "Altstadt Hechingen",
        desc: "Erkunden Sie die malerische Altstadt voller historischer Architektur und Kultur.",
      },
      {
        img: assets.disc4img,
        title: "Regionale Kunst",
        desc: "Erkunden Sie lokale Galerien und die beeindruckenden Kunstwerke in unserem Restaurant.",
      },
    ],
    en: [
      {
        img: assets.disc1img,
        title: "Hohenzollern Castle",
        desc: "Explore the grandeur of this iconic castle, a symbol of royal history and elegance, located only a 7-minute drive from our restaurant.",
      },
      {
        img: assets.disc2img,
        title: "Museum Restaurant",
        desc: "Dine like royalty with traditional Indian cuisine, in the heart of Hechingen’s charm.",
      },
      {
        img: assets.disc3img,
        title: "Old Town Hechingen",
        desc: "Wander through the picturesque old town, filled with historic architecture and culture.",
      },
      {
        img: assets.disc4img,
        title: "Regional Art",
        desc: "Explore the grandeur of this iconic castle, a symbol of royal history and elegance.",
      },
    ],
  };

  const testimonials = [
    {
      img: assets.google4,
      rating: 5,
      desc: "I had an amazing experience at the Museum Restaurant! Located near the beautiful Hohenzollern Castle, the ambiance was warm and cozy. The garlic naan and chicken tikka masala were outstanding. The service was excellent, with a friendly owner and staff. A must-visit for authentic Indian cuisine!",
      user: "Subli Das",
    },
    {
      img: assets.google3,
      rating: 5,
      desc: "Das Museum Restaurant ist ein echter Geheimtipp! Die Lage nahe der Burg Hohenzollern ist fantastisch, und das Ambiente ist elegant. Die Gemälde und Statuen machen das Essen zu einem Erlebnis. Das Tandoori-Gericht war perfekt gewürzt, und der Service war freundlich. Ich komme wieder!",
      user: "Johannes Müller",
    },
    {
      img: assets.google2,
      rating: 5,
      desc: "Eines der besten indischen Restaurants in Deutschland! Die Speisekarte bietet eine große Auswahl an authentischen Gerichten. Mein Favorit war das Lamm Biryani, hervorragend im Geschmack. Der Service war erstklassig, und der Barbereich war ein Highlight. Absolut empfehlenswert!",
      user: "Maximilian Weber",
    },
  ];

  const highQualitySection: DiscoverSection = {
    en: [
      {
        img: assets.highQ1,
        title: "Royal Indian Cuisine",
        desc: "Savor the flavors of royal Indian cuisine, where every dish is a celebration of heritage and flavor.",
      },
      {
        img: assets.highQ2,
        title: "Art-Focused Decor",
        desc: "Admire our art-focused decor that showcases the beauty of Indo-German culture while dining in elegance.",
      },
      {
        img: assets.highQ3,
        title: "Ayurvedic Indian Spices",
        desc: "Discover the secrets of Ayurveda through spices that promote health and well-being in every bite.",
      },
      {
        img: assets.highQ4,
        title: "Halal Food",
        desc: "Our chicken and lamb meat are Halal.",
      },
    ],
    de: [
      {
        img: assets.highQ1,
        title: "Königliche Indische Küche",
        desc: "Genießen Sie die Aromen der königlichen indischen Küche, in der jedes Gericht eine Feier von Tradition und Geschmack ist.",
      },
      {
        img: assets.highQ2,
        title: "Kunstorientiertes Dekor",
        desc: "Bewundern Sie unser kunstvolles Dekor, das die Schönheit der indo-deutschen Kultur in eleganter Atmosphäre widerspiegelt.",
      },
      {
        img: assets.highQ3,
        title: "Ayurvedische Indische Gewürze",
        desc: "Entdecken Sie die Geheimnisse des Ayurveda durch Gewürze, die Gesundheit und Wohlbefinden bei jedem Bissen fördern.",
      },
      {
        img: assets.highQ4,
        title: "Halal Essen",
        desc: "Unser Hähnchen- und Lammfleisch ist halal.",
      },
    ],
  };
  return (
    <>
      <Modal
        open={isBannerOpen}
        onClose={() => {
          setIsBannerOpen(false);
          setBannerSeen(false);
        }}
      >
        {banner && (
          <div className="relative text-center">
            <button
              onClick={() => setIsBannerOpen(false)}
              className="absolute top-2 right-2 z-10 bg-gray-100 bg-opacity-50 rounded-full p-1 hover:bg-opacity-75 transition"
            >
              <X size={24} color="black" />
            </button>
            <img
              src={import.meta.env.VITE_BACKEND_URL + banner.imageUrl}
              alt={banner.title}
              className="w-[90vw] sm:w-[40vw] h-auto"
            />
            {banner.title && (
              <h2 className="text-xl font-bold mt-2">{banner.title}</h2>
            )}
            {banner.description && (
              <p className="text-sm mt-1">{banner.description}</p>
            )}
          </div>
        )}
      </Modal>
      <section className="hero relative flex items-center  justify-center text-white">
        <video
          src={assets.showcaseVidFHD}
          autoPlay
          playsInline
          muted
          loop
          preload="auto"
          disablePictureInPicture
          className="absolute inset-0 w-full h-[100vh] object-cover z-0"
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100vh",
            display: "block",
          }}
        ></video>
        <div className="showcaseOverlay pt-24 pb-28 relative z-1 h-[100vh] bg-black/50 w-full">
          <div className="showcaseContent max-w-4xl mx-auto px-4">
            <h1 className="font-cormorantG text-[40px] sm:text-[60px] md:text-[80px] lg:text-[100px] leading-[1.2] text-center font-semibold">
              {language == "de"
                ? showcaseSection.de.title
                : showcaseSection.en.title}
            </h1>
            <p className="font-jost text-[14px] sm:text-[16px] md:text-[18px] mt-4 font-normal text-center">
              {language == "de"
                ? showcaseSection.de.desc
                : showcaseSection.en.desc}
            </p>
            <div className="btns flex flex-col sm:flex-row mt-8 items-center justify-center gap-6">
              <a href="#table" className="w-full sm:w-auto">
                <button className="flex gap-1 text-white bg-secondary items-center justify-center font-jost w-full sm:w-[200px] h-[50px] rounded hover:bg-secondary/80 transition-colors duration-500">
                  {language == "en" ? "BOOK A TABLE" : "TISCH RESERVIEREN"}
                </button>
              </a>
              <button
                onClick={() => navigate("/menu")}
                className="flex gap-1 text-white bg-secondary items-center justify-center font-jost w-full sm:w-[200px] h-[50px] rounded hover:bg-secondary/80 transition-colors duration-500"
              >
                {language == "en" ? "ORDER NOW" : "ONLINE BESTELLEN"}
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="welcome-section bg-welcome-pattern bg-cover bg-center ">
        <div className="welcomeContentCover max-w-[1041px] center bg-[#FCF8DF] mx-auto text-center text-[#554539] px-12 py-14">
          <h2 className="font-semibold text-[45px] font-jost mb-3 ">
            {language == "en"
              ? "A Royal Feast Near Hohenzollern Castle"
              : "Königliches Fest Nahe Der Burg Hohenzollern"}
          </h2>
          <h3 className="text-[25px] font-jost font-medium mb-6 ">
            {language == "en"
              ? "Experience the elegance of India’s royal culinary traditions. Taste history and spices in every bite."
              : "Tauchen Sie ein in die Eleganz der königlichen kulinarischen Traditionen Indiens. Genießen Sie Geschichte und Gewürze mit jedem Bissen"}
          </h3>
          <p className="mb-4 leading-7">
            {language == "en"
              ? `“Our restaurant combines the historic allure of Hechingen with the
            rich, regal traditions of India’s royal cuisine. With each dish, we
            bring centuries of flavor, elegance, and craftsmanship to your
            table, offering a culinary journey through time.”`
              : "„Unser Restaurant verbindet den historischen Charme von Hechingen mit den königlichen Traditionen der indischen Küche. Mit jedem Gericht bringen wir Geschmack, Eleganz und Handwerkskunst auf Ihren Tisch und bieten Ihnen eine kulinarische Reise durch die Zeit.“"}
          </p>
          <p className="leading-7 mb-10"></p>
          <button
            onClick={() => navigate("/menu")}
            className="flex gap-1 mx-auto  text-white bg-primary items-center place-content-center content-center font-jost w-[175px] h-[50px] rounded hover:bg-primary/80 transition-color duration-500 "
          >
            {language == "en" ? "Menu" : "SPEISEKARTE"}
          </button>
        </div>
      </section>
      <section
        id="discover-hechingan"
        className=" relative bg-discover-pattern text-white text-center pt-[16vw] bg-top bg-cover"
      >
        <h2 className="font-jost font-semibold text-[clamp(20px,4.5vw,45px)] ">
          {language == "en" ? "Discover Hechingen" : "Hechingen Entdecken"}
        </h2>
        <h3 className="font-jost mt-[1.38889vw] font-normal text-[clamp(16px,1.4vw,18px)]">
          {language == "en"
            ? "Where History Meets Culture and Flavor"
            : "Wo Geschichte auf Kultur und Geschmack trifft"}
        </h3>
        <Carousel
          className="px-[6vw] pt-[4vw] pb-[20vw]"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent>
            {discoverSection[language].map((data) => {
              return (
                <CarouselItem className="xl:basis-1/4 lg:basis-1/4 md:basis-1/3 basis-1/2">
                  <div className="text-center select-none">
                    <img
                      className="rounded-full w-3/4 border-4 mx-auto"
                      src={data.img}
                      alt=""
                    />
                    <h4 className="font-jost font-medium sm:text-xl  mt-8 mb-2">
                      {data.title}
                    </h4>
                    <p className="font-jost font-light sm:px-7 px-4 sm:text-base text-sm leading-10">
                      {data.desc}
                    </p>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
        <img
          src={assets.discBottom}
          className="absolute bottom-[-1px]"
          alt=""
        />
      </section>
      <section className="relative py-16 lg:py-24 px-6 lg:px-0">
        {/* Decorative Images */}
        <img
          src={assets.tomato}
          alt=""
          className="absolute top-0 z-[-1] w-[30vw] max-w-[96px] lg:w-[20vw] lg:max-w-96"
        />
        <img
          src={assets.coriander}
          alt=""
          className="absolute bottom-0 right-0 z-[-1] w-[30vw] max-w-[96px] lg:w-[20vw] lg:max-w-96 top-32"
        />

        {/* Content Section */}
        <div className="content text-center mx-auto">
          <h2 className="font-semibold font-jost mb-6 text-3xl md:text-4xl lg:text-5xl uppercase leading-snug lg:leading-normal text-[#554539] max-w-3xl lg:max-w-4xl mx-auto">
            {language == "en"
              ? "Germany’s Premier Indian Restaurant Presents"
              : "DEUTSCHLANDS PREMIEREN-INDISCHES RESTAURANT STELLT VOR"}
          </h2>
          <p className="text-center font-jost text-base md:text-lg text-[#554539] max-w-2xl lg:max-w-5xl mx-auto">
            {language == "en"
              ? `Inspired by the historic grandeur of Hohenzollern Castle, our Indian
        restaurant is a celebration of royal traditions and timeless taste.
        With a focus on traditional spices and historic elegance, our
        restaurant brings the culinary splendor of India’s royal heritage to
        every dish. A truly majestic dining experience awaits you.`
              : "„Inspiriert von der historischen Pracht der Burg Hohenzollern, feiert unser indisches Restaurant die königlichen Traditionen und zeitlosen Geschmacksrichtungen. Mit einem Fokus auf traditionelle Gewürze und historische Eleganz bringt unser Restaurant den kulinarischen Glanz des königlichen Erbes Indiens auf jeden Teller. Ein wahrhaft majestätisches kulinarisches Erlebnis erwartet Sie.“"}
          </p>
        </div>

        {/* Buttons Section */}
        <div className="btns flex flex-col sm:flex-row mt-10 lg:mt-14 items-center justify-center gap-4 sm:gap-6">
          <a href="#table">
            <button className="flex gap-1 text-white bg-primary items-center justify-center font-jost w-[160px] sm:w-[175px] h-[45px] sm:h-[50px] rounded hover:bg-primary/80 transition-color duration-500">
              {language == "en" ? "RESERVE TABLE" : "TISCH RESERVIEREN"}
            </button>
          </a>
          <button
            onClick={() => navigate("/menu")}
            className="flex gap-1 text-white bg-primary items-center justify-center font-jost w-[160px] sm:w-[175px] h-[45px] sm:h-[50px] rounded hover:bg-primary/80 transition-color duration-500"
          >
            {language == "en" ? "ORDER NOW" : "ONLINE BESTELLEN"}
          </button>
        </div>
      </section>
      <section className="bg-[#78303C] relative pt-[7vw] pb-[5vw] text-white">
        <img
          src={assets.highQualityBorder}
          className="absolute top-0 w-full"
          alt=""
        />
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-jost font-semibold max-w-3xl text-center mx-auto leading-normal px-4">
          {language == "en" ? "ART ON WALLS," : "KUNST AN DEN WÄNDEN,"}
          <br />
          {language == "en"
            ? "FLAVORS ON THE PLATE"
            : "GESCHMACK AUF DEM TELLER"}
        </h2>
        <div className="flex flex-wrap lg:flex-nowrap gap-8 px-4 py-12 lg:px-16 lg:py-24">
          {highQualitySection[language].map((data, index) => (
            <div
              key={index}
              className={`basis-full sm:basis-1/2 lg:basis-1/4 text-center relative ${
                index % 2 === 0
                  ? "sm:top-[-40px] lg:top-[-80px]"
                  : "sm:top-[40px] lg:top-[80px]"
              }`}
            >
              <img src={data.img} alt="" className="rounded-t-full mx-auto" />
              <h3 className="mt-4 font-jost text-lg sm:text-xl">
                {data.title}
              </h3>
              <p className="font-jost font-light px-4 sm:px-6 mt-2 text-sm sm:text-base">
                {data.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section
        id="table"
        className="relative bg-[#FCF8DF] overflow-hidden flex items-center py-20"
      >
        <img
          src={assets.mandal}
          alt=""
          className="transform absolute top-[50%] left-0 translate-y-[-50%] translate-x-[-50%] h-3/5"
        />
        <img
          src={assets.mandal}
          alt=""
          className="transform absolute top-[50%] right-0 translate-y-[-50%] translate-x-[50%] h-3/5"
        />
        <div className="flex flex-wrap lg:flex-nowrap bg-white w-[90%] lg:w-[80%] max-h-full mx-auto z-2 relative">
          {/* Form Container */}
          <div className="form-container basis-full lg:basis-3/5 py-10 px-6">
            <h2 className="text-[#554539] font-jost font-bold text-2xl sm:text-3xl lg:text-4xl text-center mb-4">
              {language == "en" ? "Reserve A Table" : "Tischreservierung"}
            </h2>
            <ReserveTableForm></ReserveTableForm>
          </div>
          {/* Image Container */}
          <div className="min-h-[250px] basis-full lg:basis-1/2 relative overflow-hidden mt-8 lg:mt-0">
            <img
              src={assets.bookingImg}
              className="block w-full lg:h-full top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%] absolute"
              alt=""
            />
          </div>
        </div>
      </section>
      <section
        className="relative w-full "
        style={{
          aspectRatio: "21/9",
        }}
      >
        <video
          src={assets.WhatsAppVideo}
          autoPlay
          playsInline
          muted
          loop
          preload="auto"
          disablePictureInPicture
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            display: "block",
          }}
        ></video>
      </section>
      <section className="relative w-full px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-jost font-semibold text-center text-[#554539] mb-8 sm:mb-12 lg:mb-16">
          {language == "en"
            ? "Customer Testimonials"
            : "Unsere Kundenbewertungen"}
        </h2>

        <Carousel
          className="mx-auto max-w-7xl"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-2 sm:-ml-4">
            {testimonials.map((data, index) => (
              <CarouselItem
                key={index}
                className="pl-2 sm:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <StarRating rating={data.rating}></StarRating>
                    <p className="font-jost text-base sm:text-lg text-[#554539] line-clamp-4 sm:line-clamp-none">
                      "{data.desc}"
                    </p>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center gap-3">
                      <img
                        src={data.img}
                        className="rounded w-8 sm:w-10 h-8 sm:h-10 object-cover"
                        alt=""
                      />
                      <h3 className="font-semibold">{data.user}</h3>
                    </div>
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center gap-4 justify-center mt-8">
            <CarouselPrevious className="border-[#2D0A17] text-[#2D0A17] relative static sm:absolute" />
            <CarouselNext className="border-[#2E0A16] bg-primary text-white relative static sm:absolute" />
          </div>
        </Carousel>
      </section>
      <section className="bg-[#78303C] text-white relative py-20 pb-60">
        <h2 className="font-jost text-5xl font-bold text-center">
          {language == "en"
            ? "Looking for a perfect gift?"
            : "Auf der Suche nach dem perfekten Geschenk?"}
        </h2>
        <p className="mt-8 mx-auto mb-12 text-center max-w-screen-lg text-2xl">
          {language == "en"
            ? "Our gift cards allow your loved ones to experience a royal feast, full of aromatic Indian spices and flavors. The perfect gift for those who love good food and culture."
            : "„Unsere Geschenkkarten schenken ein unvergessliches Erlebnis: Ein königliches Fest mit indischen Gewürzen und Geschmackswelten. Perfekt für alle, die gutes Essen und kulturelle Vielfalt schätzen.“"}
        </p>
        <Link to={"/gift-card"}>
          <button className="flex gap-1 text-white bg-secondary items-center place-content-center content-center font-jost w-[200px] h-[50px] rounded hover:bg-secondary/80 mx-auto transition-color uppercase duration-500">
            {language == "en"
              ? "View All Gift Cards"
              : "GESCHENKKARTEN ENTDECKEN"}
          </button>
        </Link>
        <img src={assets.giftCardBottom} className="absolute bottom-0" alt="" />
      </section>
      <section className="relative px-6 lg:px-20 mb-[-210px] z-10 pt-16 lg:pt-24">
        <div className="bg-[--accent-color] px-4 lg:px-8 mx-auto py-12 lg:py-16 max-w-screen-xl">
          <h2 className="font-jost font-bold text-3xl sm:text-4xl lg:text-5xl text-center mb-6 lg:mb-8 text-[#554539]">
            {language == "en" ? "Contact Us" : "Kontakt"}
          </h2>
          <div className="flex flex-wrap lg:flex-nowrap gap-6 lg:gap-4">
            {/* Map Section */}
            <div className="map basis-full lg:basis-1/2 h-[300px] sm:h-[400px] lg:h-[618px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2651.559532861968!2d8.960021176474669!3d48.34977107126759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479a025caee3deef%3A0x48134b05d76cf695!2sMuseum%20Restaurant!5e0!3m2!1sen!2sin!4v1730740243911!5m2!1sen!2sin"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            {/* Contact Form Section */}
            <div className="form-container basis-full lg:basis-1/2">
              <ContactForm btnPrimary={true} color="#000000"></ContactForm>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default Home;
