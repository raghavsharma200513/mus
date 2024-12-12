import { assets } from "@/assets/assets";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  ChefHat,
  Martini,
  PartyPopper,
  Baby,
  Accessibility,
  Cat,
  TreeDeciduous,
} from "lucide-react";
import CountUp from "react-countup";

function AboutUs() {
  const achievements = [
    { no: 300, name: "Daily Visitors" },
    { no: 50, name: "Recipes Created" },
    { no: 350, name: "Events Catered" },
    { no: 5000, name: "Orders Delivered" },
  ];
  const teamImg = [assets.teamImg, assets.teamImg];
  return (
    <main>
      <div className="page-title">
        <h1>About Us</h1>
        <h2>Home / About Us</h2>
      </div>
      <section className="relative pb-10">
        <img
          src={assets.decor1}
          alt=""
          className="decor1 absolute top-0 right-0"
        />
        <img
          src={assets.decor2}
          alt=""
          className="decor2 absolute bottom-0 right-0 z-[-1] w-[25vw] max-w-96"
        />
        <div className="flex items-center pr-40">
          <div className="imgArea pr-20 basis-1/2">
            <img src={assets.aboutMuseumPic} className="w-full" alt="" />
          </div>
          <div className="box font-jost basis-1/2 text-[#554539] flex flex-col gap-6">
            <h2 className="font-semibold text-5xl">
              Museum Restaurant, Hechingen
            </h2>
            <p>
              At the heart of Hechingen, near the historic Hohenzollern Castle,
              our restaurant offers an immersive dining experience that
              celebrates the rich traditions of India. Our dishes are crafted
              using authentic spices that reflect centuries of royal culinary
              heritage. With a focus on history, culture, and flavor, we invite
              you to savor the essence of India in a setting that merges
              elegance with tradition.
            </p>
            <div className="text-lg">
              <h3 className="text-lg">
                <b>OPENING HOURS</b>
              </h3>
              <p>Mon – thu: 10 am – 01 am</p>
              <p>Fri – sun: 10 am – 02 am</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="features flex justify-center items-center gap-10 mt-10">
          <div className="feature flex flex-col items-center text-center">
            <Cat className="w-10 h-10 text-[#554539]" />
            {/* < /> */}
            <p className="mt-2 text-[#554539] font-medium">Pet Friendly</p>
          </div>
          <div className="feature flex flex-col items-center text-center">
            <TreeDeciduous className="w-10 h-10 text-[#554539]" />
            <p className="mt-2 text-[#554539] font-medium">Outdoor Setting</p>
          </div>
          <div className="feature flex flex-col items-center text-center">
            <Baby className="w-10 h-10 text-[#554539]" />
            <p className="mt-2 text-[#554539] font-medium">Kid Friendly</p>
          </div>
          <div className="feature flex flex-col items-center text-center">
            <Accessibility className="w-10 h-10 text-[#554539]" />
            <p className="mt-2 text-[#554539] font-medium">
              Disabled/Wheelchair Friendly
            </p>
          </div>
        </div>
      </section>
      <section className="founder px-32 py-20 bg-[--base-color] relative overflow-hidden">
        <img
          src={assets.mandal}
          alt=""
          className="mandalLeft absolute left-0 top-[50%] h-full  translate-x-[-50%] translate-y-[-50%]"
        />
        <img
          src={assets.mandal}
          alt=""
          className="mandalLeft absolute right-0 top-[50%] h-full  translate-x-[86%] translate-y-[-50%]"
        />
        <div className="box flex relative z-[1] items-center">
          <div className="founderImgContainer pr-20 basis-1/2">
            <img
              src={assets.Picsart}
              alt=""
              className="founderImg rounded-full"
            />
          </div>
          <div className="founderContent font-jost basis-1/2 text-[#554539]">
            <h2 className="font-semibold   mb-6 text-5xl">Our Owner</h2>
            <p className="text-lg">
              <b>Mandeep Singh</b> is a trailblazing entrepreneur, the first
              Indian to establish a restaurant in the iconic Museum Hechingen.
              Influenced by legendary chefs Manjit Singh Gill and Imtiaz
              Qureshi, he blends Ayurvedic principles, Punjabi flavors, and
              modern innovation to create a unique dining experience with
              organic, sustainably sourced ingredients. Inspired by cultural
              icon Diljit Dosanjh, Mandeep's vibrant energy bridges cultures and
              creates Lan inviting space that celebrates.
            </p>
          </div>
        </div>
      </section>
      <section className="relative py-20 font-jost text-[#554539] services">
        <img
          src={assets.leaf1}
          alt=""
          className="decor1 absolute top-[-40px] right-0 z-[-1] w-[15vw] max-w-96"
        />
        <img
          src={assets.leaf2}
          alt=""
          className="decor1 absolute z-[-1] w-[10vw] max-w-96 bottom-0"
        />
        <div className="box mx-20">
          <h2 className=" text-5xl mb-12 font-semibold text-center">
            Our Services
          </h2>
          <div className="flex items-stretch justify-between text-center gap-2">
            <Card className="flex-1 flex  shadow-none text-[#554539] hover:bg-[--primary-bg-color] hover:text-white transition duration-150 p-8 border-none">
              <CardContent className="p-0 space-y-4 ">
                <ChefHat
                  size="4em"
                  absoluteStrokeWidth={true}
                  className="mx-auto "
                />
                <h3 className=" text-3xl font-semibold">Catering </h3>
                <p className=" text-lg">
                  From intimate gatherings to grand celebrations, our indoor &
                  outdoor catering services ensure that every dish is a culinary
                  masterpiece.
                </p>
              </CardContent>
            </Card>
            <Card className="flex-1 flex hover:bg-[--primary-bg-color] hover:text-white transition duration-150 shadow-none border-none p-8 text-[#554539]">
              <CardContent className="space-y-4 p-0">
                <PartyPopper
                  size="4em"
                  absoluteStrokeWidth={true}
                  className="mx-auto "
                />
                <h3 className=" text-3xl font-semibold">Event Hall</h3>
                <p className="  text-lg">
                  With a focus on elegance and comfort, our Event Hall is the
                  ideal venue for any event. Contact us for booking information.
                </p>
              </CardContent>
            </Card>
            <Card className="flex-1 flex hover:bg-[--primary-bg-color] hover:text-white transition duration-150  border-none text-[#554539] shadow-none p-8">
              <CardContent className="space-y-4 p-0">
                <Martini
                  size="4em"
                  absoluteStrokeWidth={true}
                  className="mx-auto "
                />
                <h3 className=" text-3xl font-semibold">Bar</h3>
                <p className="text-lg">
                  Enjoy an array of drinks at our bar, from signature cocktails
                  and mocktails to premium spirits and fine wines.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="ourTeam overflow-hidden">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent>
            {teamImg.map((img) => {
              return (
                <CarouselItem>
                  <img src={img} alt="" />
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>
      <section className="vision&mission relative">
        <img
          src={assets.leaf3}
          alt=""
          className="decor1 absolute z-[-1] w-[10vw] max-w-96 bottom-[-50px]"
        />
        <div className="flex items-center mx-20">
          <div className="content flex-1 font-jost text-[#554539]">
            <h2 className="text-5xl font-semibold mb-12">
              Our Vision & Mission
            </h2>
            <p className="text-lg">
              Our vision is to be recognized as the premier Indian restaurant,
              dedicated to sharing the diverse flavors and rich culture of
              India. We aspire to create memorable dining experiences through
              exceptional hospitality, catering to both social and business
              gatherings. With a commitment to quality and service, we aim to
              expand our presence, bringing our unique culinary offerings to
              even more communities. Our passion for Indian cuisine drives us to
              innovate and enhance our menu continually.
            </p>
          </div>
          <div className="imgContainer flex justify-end flex-1">
            <img src={assets.visionImg} className=" rounded-tl-[30%]" alt="" />
          </div>
        </div>
      </section>
      <section className="Achievements p-32 text-[#554539] font-jost">
        <h2 className="text-5xl text-center font-semibold mb-20">
          Celebrating Our Achievements
        </h2>
        <div className="flex justify-between items-center">
          {achievements.map((achievement) => {
            return (
              <div className="flex gap-6 items-center">
                <p className="text-5xl font-semibold">
                  <CountUp
                    enableScrollSpy={true}
                    end={achievement.no}
                  ></CountUp>
                  +
                </p>
                <p className="w-min uppercase">{achievement.name}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
export default AboutUs;
