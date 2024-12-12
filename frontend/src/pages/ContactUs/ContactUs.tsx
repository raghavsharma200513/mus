import { assets } from "@/assets/assets";
import ContactForm from "../Home/ContactForm";
import Facebook from "@/components/social_icons/Facebook";
import Instagram from "@/components/social_icons/Instagram";
import ContactDetailsBG from "@/components/ContactDetailsBG";

function ContactUs() {
  const details = [
    {
      title: "Opening Hours",
      content:
        "Monday: Closed<br>Tuesday - Friday:10:30–14:00,<br>16:30–23:00<br>Saturday: 12:00–23:00<br>Sunday: 12:00–23:00",
    },
    {
      title: "Address",
      content:
        // "Zollernstraße 2, 72379 Hechingen, Germany<br><br>Check Location",
        'Zollernstraße 2, 72379 Hechingen, Germany<br><br><a href="https://maps.app.goo.gl/cNTSeoC9ty3zwacg6" target="_blank">Check Location</a>',
    },
    {
      title: "Get In Touch",
      content:
        "Telephone: +49 7471 13015<br>Email: abc@gmail.com<br><br>Contact Us",
    },
  ];
  return (
    <main className="">
      <div className="page-title">
        <h1>Contact Us</h1>
        <h2>HOME / CONTACT US</h2>
      </div>

      <section className="relative my-12 mx-20 bg-primary overflow-hidden py-12">
        <h1 className="font-jost font-semibold text-white text-3xl  mx-auto mb-8 text-center">
          Send Us A Message
        </h1>
        <img
          src={assets.elephantImg}
          className="bg-left absolute bottom-0 left-0 translate-x-[-50%] block h-3/4"
          alt=""
        />
        <img
          src={assets.elephantImg}
          className="bg-left absolute bottom-0 right-0 translate-x-[50%] block h-3/4"
          alt=""
        />
        <img
          src={assets.mandalWhite}
          alt=""
          className="absolute top-[50%] h-full translate-y-[-50%] left-[50%] translate-x-[-50%] bg-center"
        />
        <div className="max-w-screen-sm relative z-10 mx-auto">
          <ContactForm btnPrimary={false}></ContactForm>
        </div>
      </section>
      <section className="flex relative my-12 gap-10 mx-20">
        <div className="relative overflow-hidden aspect-square basis-1/2">
          <video
            controls={false}
            src={assets.contactUs}
            autoPlay
            loop
            className="absolute object-cover h-full locGif "
          />
        </div>
        <div className="map basis-1/2">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2651.559532861968!2d8.960021176474669!3d48.34977107126759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479a025caee3deef%3A0x48134b05d76cf695!2sMuseum%20Restaurant!5e0!3m2!1sen!2sin!4v1730740243911!5m2!1sen!2sin"
            className=" w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
      <section className="socialLinks my-12 font-jost text-[--primary-color] font-semibold text-xl justify-center flex gap-6 items-center">
        <p>Follow Our Social Media:</p>
        <div className="socials-footer flex gap-3">
          <a href="" className="fb block bg-primary/20 rounded-full p-2">
            <Facebook fill="hsl(var(--primary))" width={20}></Facebook>
          </a>
          {/* <a href="" className="twitt block bg-primary/20 rounded-full p-2"><Twitter fill="hsl(var(--primary))" width={20}></Twitter></a>
          <a href="" className="linkd block bg-primary/20 rounded-full p-2"><LinkdIn fill="hsl(var(--primary))" width={20}></LinkdIn></a> */}
          <a href="" className="inst block bg-primary/20 rounded-full p-2">
            <Instagram fill="hsl(var(--primary))" width={20}></Instagram>
          </a>
        </div>
      </section>
      <section className="relative z-10 flex gap-[6vw] mx-20">
        {details.map(({ title, content }) => {
          return <ContactDetailsBG title={title} content={content} />;
        })}
      </section>
    </main>
  );
}
export default ContactUs;
