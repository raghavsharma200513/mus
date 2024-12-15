import { assets } from "@/assets/assets";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import LanguageContext from "@/context/LanguageContext";
import {
  ChefHat,
  Martini,
  PartyPopper,
  Baby,
  Accessibility,
  Cat,
  TreeDeciduous,
} from "lucide-react";
import { useContext } from "react";
import CountUp from "react-countup";

function AboutUs() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }
  const { language } = context;
  const achievements = [
    {
      no: 300,
      name: language == "en" ? "Daily Visitors" : "TÄGLICHE BESUCHER",
    },
    {
      no: 50,
      name: language == "en" ? "Recipes Created" : "ERSTELLTE REZEPTE",
    },
    {
      no: 350,
      name: language == "en" ? "Events Catered" : "VERANSTALTUNGEN",
    },
    {
      no: 5000,
      name: language == "en" ? "Orders Delivered" : "GELIEFERTE ",
    },
  ];
  const teamImg = [assets.teamImg, assets.teamImg];

  return (
    <main className="w-full overflow-x-hidden">
      {/* Page Title */}
      <div className="page-title text-center py-8 bg-gray-100">
        <h1 className="text-3xl md:text-4xl font-bold text-[#554539]">
          {language == "en" ? "About Us" : "Über Uns"}
        </h1>
        <h2 className="text-lg text-gray-600">Home / About Us</h2>
      </div>

      {/* About Section */}
      <section className="relative pb-10 px-4 md:px-10 lg:px-20">
        {/* Decorative Images */}
        <img
          src={assets.decor1}
          alt=""
          className="decor1 absolute top-0 right-0 hidden md:block"
        />
        <img
          src={assets.decor2}
          alt=""
          className="decor2 absolute bottom-0 right-0 z-[-1] w-[25vw] max-w-96 hidden md:block"
        />

        {/* About Content */}
        <div className="flex flex-col md:flex-row items-center">
          <div className="imgArea md:pr-20 md:basis-1/2 mb-8 md:mb-0">
            <img
              src={assets.WhatsApp}
              className="w-full rounded-lg shadow-md"
              alt="Museum Restaurant"
            />
          </div>
          <div className="box font-jost md:basis-1/2 text-[#554539] text-center md:text-left">
            <h2 className="font-semibold text-3xl md:text-5xl mb-4">
              Museum Restaurant, Hechingen
            </h2>
            <p className="mb-6 text-base md:text-lg">
              {language == "en"
                ? `At the heart of Hechingen, near the historic Hohenzollern Castle,
              our restaurant offers an immersive dining experience that
              celebrates the rich traditions of India. Our dishes are crafted
              using authentic spices that reflect centuries of royal culinary
              heritage. With a focus on history, culture, and flavor, we invite
              you to savor the essence of India in a setting that merges
              elegance with tradition.`
                : "Im Herzen von Hechingen, in der Nähe der historischen Burg Hohenzollern, bietet unser Restaurant ein immersives kulinarisches Erlebnis, das die reichen Traditionen Indiens feiert. Unsere Gerichte werden mit authentischen Gewürzen zubereitet, die Jahrhunderte königlichen kulinarischen Erbes widerspiegeln. Mit einem Fokus auf Geschichte, Kultur und Geschmack laden wir Sie ein, die Essenz Indiens in einem Ambiente zu genießen, das Eleganz mit Tradition verbindet."}
            </p>
            {/* <div className="text-base">
              <h3 className="text-lg font-bold mb-2">OPENING HOURS{language == "en" ? "Voucher" : "GUTSCHEIN"}</h3>
              <p>Mon – thu: 10 am – 01 am</p>
              <p>Fri – sun: 10 am – 02 am</p>
            </div> */}
          </div>
        </div>

        {/* Features Section */}
        <div className="features flex flex-wrap justify-center items-center gap-6 mt-10">
          {[
            {
              Icon: Cat,
              text: language == "en" ? "Pet Friendly" : "Tierfreundlich",
            },
            {
              Icon: TreeDeciduous,
              text: language == "en" ? "Outdoor Setting" : "Außenbereich Essen",
            },
            {
              Icon: Baby,
              text: language == "en" ? "Kid Friendly" : "Kinderfreundlich",
            },
            {
              Icon: Accessibility,
              text:
                language == "en"
                  ? "Disabled/Wheelchair Friendly"
                  : "Behinderten-/Rollstuhlgerecht",
            },
          ].map(({ Icon, text }, index) => (
            <div
              key={index}
              className="feature flex flex-col items-center text-center w-40"
            >
              <Icon className="w-10 h-10 text-[#554539] mb-2" />
              <p className="text-[#554539] font-medium">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder Section */}
      <section className="founder px-4 md:px-32 py-10 md:py-20 bg-[--base-color] relative overflow-hidden">
        <img
          src={assets.mandal}
          alt=""
          className="mandalLeft absolute left-0 top-[50%] h-full translate-x-[-50%] translate-y-[-50%] hidden md:block"
        />
        <img
          src={assets.mandal}
          alt=""
          className="mandalLeft absolute right-0 top-[50%] h-full translate-x-[86%] translate-y-[-50%] hidden md:block"
        />
        <div className="box flex flex-col md:flex-row relative z-[1] items-center">
          <div className="founderImgContainer md:pr-20 mb-8 md:mb-0 md:basis-1/2 flex justify-center">
            <img
              src={assets.Picsart}
              alt="Founder"
              className="founderImg rounded-full w-64 h-64 object-cover"
            />
          </div>
          <div className="founderContent font-jost md:basis-1/2 text-[#554539] text-center md:text-left">
            <h2 className="font-semibold mb-6 text-3xl md:text-5xl">
              {language == "en" ? "Our Owner" : "GUTSCHEIN"}
            </h2>
            <p className="text-base md:text-lg">
              <b>Mandeep Singh</b>
              {language == "en"
                ? ` is a trailblazing entrepreneur, the first Indian to establish a restaurant in the iconic Museum Hechingen. Influenced by legendary chefs Manjit Singh Gill and Imtiaz Qureshi, he blends Ayurvedic principles, Punjabi flavors, and modern innovation to create a unique dining experience with organic, sustainably sourced ingredients. Inspired by cultural icon Diljit Dosanjh, Mandeep’s vibrant energy bridges cultures and creates an inviting space that celebrates Indian heritage. His journey shows how passion and authenticity can transform a historic venue into a modern culinary destination, connecting India and Germany. His restaurant is now a must-visit for food lovers seeking both history and flavor.`
                : ` ist ein visionärer Unternehmer und der erste Inder, der ein Restaurant in Hechingen gegründet hat. Beeinflusst von den legendären Köchen Manjit Singh Gill und Imtiaz Qureshi kombiniert er ayurvedische Prinzipien, Punjabi-Aromen und moderne Innovationen, um ein einzigartiges kulinarisches Erlebnis mit biologisch und nachhaltig bezogenen Zutaten zu schaffen. Inspiriert von der kulturellen Ikone Diljit Dosanjh verbindet Mandeeps dynamische Ausstrahlung Kulturen und schafft einen einladenden Raum, der das indische Erbe feiert. Seine Reise zeigt, wie Leidenschaft und Authentizität ein historisches Lokal in eine moderne kulinarische Destination verwandeln können, die Indien und Deutschland verbindet. Sein Restaurant ist heute ein Muss für Feinschmecker, die sowohl Geschichte als auch Geschmack suchen.`}
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative py-10 md:py-20 font-jost text-[#554539] services ">
        <img
          src={assets.leaf1}
          alt=""
          className="decor1 absolute top-[-40px] right-0 z-[-1] w-[15vw] max-w-96 hidden md:block"
        />
        <img
          src={assets.leaf2}
          alt=""
          className="decor1 absolute z-[-1] w-[10vw] max-w-96 bottom-0 hidden md:block"
        />
        <div className="box px-4 md:px-20">
          <h2 className="text-3xl md:text-5xl mb-12 font-semibold text-center">
            {language == "en" ? "Our Services" : "Unsere Leistungen"}
          </h2>
          <div className="flex flex-col md:flex-row items-stretch justify-between text-center gap-4">
            {[
              {
                Icon: ChefHat,
                title: language == "en" ? " Catering" : "Catering",
                description:
                  language == "en"
                    ? "From intimate gatherings to grand celebrations, our indoor & outdoor catering services ensure that every dish is a culinary masterpiece."
                    : "Von kleinen Zusammenkünften bis hin zu großen Feiern – unsere Catering-Services für drinnen und draußen sorgen dafür, dass jedes Gericht ein kulinarisches Meisterwerk ist.",
              },
              {
                Icon: PartyPopper,
                title: language == "en" ? "Event Hall" : "Veranstaltungssaal",
                description:
                  language == "en"
                    ? "With a focus on elegance and comfort, our Event Hall is the ideal venue for any event. Contact us for booking information."
                    : "Mit einem Fokus auf Eleganz und Komfort ist unser Veranstaltungssaal der ideale Ort für jedes Event. Kontaktieren Sie uns für weitere Informationen zur Buchung.",
              },
              {
                Icon: Martini,
                title: language == "en" ? " Bar" : "Bar",
                description:
                  language == "en"
                    ? "Enjoy an array of drinks at our bar, from signature cocktails and mocktails to premium spirits and fine wines."
                    : "Erleben Sie exquisite Getränke an unserer Bar – von kreativen Cocktails und Mocktails bis hin zu edlen Spirituosen und feinen Weinen.",
              },
            ].map(({ Icon, title, description }, index) => (
              <Card
                key={index}
                className="flex-1 flex hover:bg-[--primary-bg-color] hover:text-white transition duration-150 shadow-none border-none p-6 md:p-8 text-[#554539] mb-4 md:mb-0"
              >
                <CardContent className="p-0 space-y-4 text-center">
                  <Icon
                    size="4em"
                    absoluteStrokeWidth={true}
                    className="mx-auto"
                  />
                  <h3 className="text-2xl md:text-3xl font-semibold">
                    {title}
                  </h3>
                  <p className="text-base md:text-lg">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Carousel */}
      <section className="ourTeam overflow-hidden px-4 md:px-0">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent>
            {teamImg.map((img, index) => (
              <CarouselItem key={index} className="pl-4">
                <img src={img} alt="Team" className="w-full object-cover" />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </section>

      {/* Vision & Mission Section */}
      <section className="vision-mission relative py-10 md:py-20">
        <img
          src={assets.leaf3}
          alt=""
          className="decor1 absolute z-[-1] w-[10vw] max-w-96 bottom-[-50px] hidden md:block"
        />
        <div className="flex flex-col md:flex-row px-4 md:px-20 items-center">
          <div className="content flex-1 font-jost text-[#554539] mb-8 md:mb-0 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-semibold mb-6 md:mb-12">
              {language == "en"
                ? " Our Vision & Mission"
                : "Unsere Vision & Mission"}
            </h2>
            <p className="text-base md:text-lg">
              {language == "en"
                ? `Our vision is to be recognized as the premier Indian restaurant,
              dedicated to sharing the diverse flavors and rich culture of
              India. We aspire to create memorable dining experiences through
              exceptional hospitality, catering to both social and business
              gatherings. With a commitment to quality and service, we aim to
              expand our presence, bringing our unique culinary offerings to
              even more communities. Our passion for Indian cuisine drives us to
              innovate and enhance our menu continually.`
                : "Unsere Vision ist es, als das führende indische Restaurant anerkannt zu werden, das sich der Weitergabe der vielfältigen Aromen und der reichen Kultur Indiens widmet. Wir streben danach, unvergessliche kulinarische Erlebnisse durch außergewöhnliche Gastfreundschaft zu schaffen – sowohl für gesellschaftliche als auch geschäftliche Zusammenkünfte. Mit einem Engagement für Qualität und Service möchten wir unsere Präsenz ausbauen und unsere einzigartigen kulinarischen Angebote noch mehr Gemeinschaften zugänglich machen. Unsere Leidenschaft für die indische Küche treibt uns dazu an, unser Menü kontinuierlich zu verbessern und zu erweitern."}
            </p>
          </div>
          <div className="imgContainer flex justify-center md:justify-end flex-1">
            <img
              src={assets.visionImg}
              className="rounded-tl-[30%] max-w-full md:max-w-md"
              alt="Vision"
            />
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="Achievements p-6 md:p-32 text-[#554539] font-jost">
        <h2 className="text-3xl md:text-5xl text-center font-semibold mb-10 md:mb-20">
          {language == "en"
            ? "Celebrating Our Achievements"
            : "Unsere Erfolge feiern"}
        </h2>
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-6">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-2 md:gap-6 items-center text-center md:text-left"
            >
              <p className="text-3xl md:text-5xl font-semibold">
                <CountUp enableScrollSpy={true} end={achievement.no}></CountUp>+
              </p>
              <p className="uppercase text-sm md:text-base">
                {achievement.name}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default AboutUs;
