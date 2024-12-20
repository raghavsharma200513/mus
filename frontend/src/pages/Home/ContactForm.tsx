"use client";

import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ContactProps } from "@/Interface";
import LanguageContext from "@/context/LanguageContext";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  phone: z
    .string()
    .min(10, {
      message: "Contact Number must be at least 10 digits.",
    })
    .regex(
      /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
      "Invalid Contact Number"
    ),
  email: z
    .string()
    .regex(
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
      "Enter a valid email."
    ),
  message: z.string().min(5, "Message must be at least 5 characters."),
  newsletter: z.boolean().default(false),
});

const ContactForm: React.FC<ContactProps> = ({ btnPrimary, color }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
      newsletter: true,
    },
  });

  const context = useContext(LanguageContext);
  const { language } = context || { language: "en" };

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setStatus("loading");
    setErrorMessage("");
    console.log(values);

    try {
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + "/api/message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send the message.");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      if (err instanceof Error) {
        setStatus("error");
        setErrorMessage(err.message);
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-${color}`}>
                {language === "en" ? "Name" : "Name"}
              </FormLabel>
              <FormControl>
                <Input
                  className="bg-white"
                  placeholder={
                    language === "en"
                      ? "Enter your full name"
                      : "Vor- und Nachname eingeben"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="basis-1/2">
                <FormLabel className={`text-${color}`}>
                  {language === "en" ? "Phone" : "Telefon"}
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-white"
                    placeholder={
                      language === "en"
                        ? "Enter your phone no."
                        : "Telefonnummer eingeben"
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="basis-1/2">
                <FormLabel className={`text-${color}`}>
                  {language === "en" ? "Email" : "E-Mail"}
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-white"
                    placeholder={
                      language === "en"
                        ? "Enter your email address"
                        : "E-Mail Adresse eingeben"
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-${color}`}>
                {language === "en" ? "Your Message" : "Nachricht"}
              </FormLabel>
              <FormControl>
                <Textarea
                  className="bg-white min-h-56"
                  placeholder={
                    language === "en"
                      ? "Write your message here!"
                      : "Nachricht hier schreiben!"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className={`font-jost text-sm text-${color}`}>
          {language == "en"
            ? "By sending this message, I consent to the data protection policy and the electronic collection and storage of my data to answer my request."
            : "Mit dem Absenden dieser Nachricht stimme ich der Datenschutzerklärung und der elektronischen Erfassung sowie Speicherung meiner Daten zur Beantwortung meiner Anfrage zu."}
        </p>

        <FormField
          control={form.control}
          name="newsletter"
          render={({ field }) => (
            <FormItem className="flex flex-col md:flex-row items-start space-y-3 md:space-y-0 md:space-x-3 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className={`text-${color}`}>
                  {language == "en"
                    ? "Subscribe to Newsletter"
                    : "Newsletter abonnieren"}
                </FormLabel>
                <FormDescription className={`text-${color}`}>
                  {language == "en"
                    ? "I would like to subscribe to the newsletter to receive all the culinary highlights."
                    : "Ich möchte den Newsletter abonnieren, um alle kulinarischen Highlights zu erhalten."}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex ">
          <Button
            className="flex-1 mx-8 uppercase rounded-s"
            variant={btnPrimary ? "default" : "accent"}
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading"
              ? language === "en"
                ? "Sending..."
                : "Senden..."
              : language === "en"
              ? "SEND US A MESSAGE"
              : "NACHRICHT SENDEN"}
          </Button>
        </div>

        {status === "success" && (
          <p className="text-center text-green-500">
            {language === "en"
              ? "Message sent successfully!"
              : "Nachricht erfolgreich gesendet!"}
          </p>
        )}
        {status === "error" && (
          <p className="text-center text-red-500">{errorMessage}</p>
        )}
      </form>
    </Form>
  );
};

export default ContactForm;
