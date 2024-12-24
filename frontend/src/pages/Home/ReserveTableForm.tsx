"use client";

import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, isToday, parse, isWithinInterval } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { assets } from "@/assets/assets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import Modal from "@/components/Modal";
import LanguageContext from "@/context/LanguageContext";

const WORKING_HOURS = {
  1: [], // Monday - Closed
  2: [
    // Tuesday
    { start: "10:30", end: "14:00" },
    { start: "16:30", end: "23:00" },
  ],
  3: [
    // Wednesday
    { start: "10:30", end: "14:00" },
    { start: "16:30", end: "23:00" },
  ],
  4: [
    // Thursday
    { start: "10:30", end: "14:00" },
    { start: "16:30", end: "23:00" },
  ],
  5: [
    // Friday
    { start: "10:30", end: "14:00" },
    { start: "16:30", end: "23:00" },
  ],
  6: [
    // Saturday
    { start: "12:00", end: "23:00" },
  ],
  0: [
    // Sunday
    { start: "12:00", end: "23:00" },
  ],
};

// Updated time slots generation
const generateTimeSlots = (selectedDate: Date | undefined) => {
  if (!selectedDate) return [];

  const timeSlots = [];
  // const currentDate = new Date();
  const dayOfWeek = selectedDate.getDay();
  const workingHoursForDay =
    WORKING_HOURS[dayOfWeek as keyof typeof WORKING_HOURS];

  // If it's Monday (closed) or no working hours defined, return empty array
  if (!workingHoursForDay || workingHoursForDay.length === 0) {
    return [];
  }

  // Helper function to check if a time is within working hours
  const isWithinWorkingHours = (timeStr: string) => {
    const timeToCheck = parse(timeStr, "HH:mm", new Date());

    return workingHoursForDay.some((period) => {
      const startTime = parse(period.start, "HH:mm", new Date());
      const endTime = parse(period.end, "HH:mm", new Date());
      return isWithinInterval(timeToCheck, { start: startTime, end: endTime });
    });
  };

  // Generate all possible 30-minute slots
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      const timeStr = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;

      // Skip if time is not within working hours
      if (!isWithinWorkingHours(timeStr)) {
        continue;
      }

      // For today, skip times that have already passed
      if (isToday(selectedDate)) {
        const currentTime = new Date();
        const slotTime = parse(timeStr, "HH:mm", currentTime);
        if (slotTime <= currentTime) {
          continue;
        }
      }

      timeSlots.push({
        value: timeStr,
        label: timeStr,
      });
    }
  }

  return timeSlots;
};

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  phone: z
    .string()
    .min(10, { message: "Contact Number must be at least 10 digits." })
    .regex(
      /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
      "Invalid Contact Number"
    ),
  email: z.string().email({ message: "Enter a valid email address." }),
  date: z
    .date({
      invalid_type_error: "Please select a valid date.",
    })
    .refine(
      (date) => {
        const dayOfWeek = date.getDay();
        return dayOfWeek !== 1; // Reject Mondays
      },
      {
        message: "Restaurant is closed on Mondays.",
      }
    )
    .refine(
      (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      {
        message: "Date cannot be in the past.",
      }
    ),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/, {
    message: "Time must be in HH:mm format.",
  }),
  numberOfGuests: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 20, {
      message: "Guests must be between 1 and 20.",
    }),
  newsletter: z.boolean(),
});

function ReserveTableForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmissionSuccessful, setIsSubmissionSuccessful] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(
    null
  );
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("LanguageSelector must be used within a LanguageProvider");
  }
  const { language } = context;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      newsletter: true,
      numberOfGuests: +"1",
      // Removed default time
      time: "",
    },
  });
  const timeSlots = generateTimeSlots(form.watch("date"));

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Allow today's date and reject only past dates
    if (checkDate < today) {
      return true;
    }

    // If it's Monday, show message instead of just disabling
    if (date.getDay() === 1) {
      return true;
    }

    return false;
  };

  const openConfirmationModal = (values: z.infer<typeof formSchema>) => {
    setFormData(values);
    setIsModalOpen(true);
  };

  const handleConfirmReservation = async () => {
    if (!formData) return;

    try {
      setLoading(true);
      const submissionData = {
        ...formData,
        date: formData.date.toISOString().split("T")[0],
      };

      await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/reservation/",
        submissionData
      );

      setIsSubmissionSuccessful(true);

      setTimeout(() => {
        setIsModalOpen(false);
        setIsSubmissionSuccessful(false);
      }, 3000000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.message || "Unknown error.";
        console.error("Server error:", serverMessage);

        form.setError("root", {
          type: "manual",
          message: `Reservation failed: ${serverMessage}`,
        });
      } else {
        console.error("Unexpected error:", error);
        form.setError("root", {
          type: "manual",
          message: "Unexpected error. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubmissionSuccessful(false);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    openConfirmationModal(values);
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full max-w-2xl mx-auto px-4 md:px-0"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      language == "en"
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

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{language == "en" ? "Phone" : "Telefon"}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      language == "en"
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
              <FormItem>
                <FormLabel>{language == "en" ? "Email" : "E-Mail"}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      language == "en"
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

          {/* Date and Time Section */}
          <div className="flex flex-col md:flex-row gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="w-full md:basis-1/2">
                  <FormLabel>{language == "en" ? "Date" : "Datum"}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PP")
                          ) : (
                            <span>
                              {language == "en"
                                ? "Select a Date"
                                : "Datum auswählen"}
                            </span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-3">
                        {field.value?.getDay() === 1 && (
                          <div className="text-red-500 text-sm mb-2">
                            {language === "en"
                              ? "Restaurant is closed on Mondays"
                              : "Restaurant ist montags geschlossen"}
                          </div>
                        )}
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={isDateDisabled}
                          initialFocus
                          modifiers={{
                            closed: (date) => date.getDay() === 1,
                          }}
                          modifiersStyles={{
                            closed: {
                              color: "var(--red-500)",
                              textDecoration: "line-through",
                            },
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="w-full md:basis-1/2">
                  <FormLabel>{language == "en" ? "Time" : "Uhrzeit"}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            language == "en"
                              ? timeSlots.length > 0
                                ? "Select a Time"
                                : "No times available"
                              : timeSlots.length > 0
                              ? "Uhrzeit auswählen"
                              : "Keine Zeiten verfügbar"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Persons and Submit Button Section */}
          <div className="flex flex-col md:flex-row gap-4">
            <FormField
              control={form.control}
              name="numberOfGuests"
              render={({ field }) => (
                <FormItem className="w-full md:basis-1/2">
                  <FormLabel>
                    {language == "en" ? "Persons" : "Personen"}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            language == "en"
                              ? "Select number of persons"
                              : "Anzahl der Personen auswählen"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[...Array(20)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {language === "en"
                            ? `${i + 1} ${i === 0 ? "Person" : "Persons"}`
                            : `${i + 1} ${i === 0 ? "Person" : "Personen"}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-full md:basis-1/2 h-10 mt-auto"
              type="submit"
              disabled={!form.watch("time")}
            >
              {language == "en" ? "Reserve Now" : "JETZT RESERVIEREN"}
            </Button>
          </div>

          <p className="font-jost text-sm text-center md:text-left">
            {language == "en"
              ? "By reserving a table, I consent to the data protection policy and the electronic collection and storage of my data to answer my request."
              : "Mit der Reservierung eines Tisches stimme ich der Datenschutzerklärung und der elektronischen Erfassung sowie Speicherung meiner Daten zur Beantwortung meiner Anfrage zu."}
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
                  <FormLabel>
                    {language == "en"
                      ? "Subscribe to Newsletter"
                      : "Newsletter abonnieren"}
                  </FormLabel>
                  <FormDescription>
                    {language == "en"
                      ? "I would like to subscribe to the newsletter to receive all the culinary highlights."
                      : "Ich möchte den Newsletter abonnieren, um alle kulinarischen Highlights zu erhalten."}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <div className="p-6 bg-white rounded-lg max-w-md mx-auto relative">
          {!isSubmissionSuccessful ? (
            <>
              <div className="flex flex-col items-center gap-4 md:gap-6">
                <h2 className="text-[#2e0a16] text-2xl md:text-3xl font-bold text-center">
                  {" "}
                  {language == "en"
                    ? "Confirm Reservation"
                    : "Bestätigen Sie Ihre Reservierung!"}
                </h2>
                <img
                  src={assets.galBottom}
                  alt="divider"
                  className="w-32 md:w-52"
                />
              </div>
              {formData && (
                <div className="space-y-2 mb-6">
                  <p>
                    <strong>{language == "en" ? "Name" : "Name"}:</strong>{" "}
                    {formData.name}
                  </p>
                  <p>
                    <strong> {language == "en" ? "Phone" : "Telefon"}:</strong>{" "}
                    {formData.phone}
                  </p>
                  <p>
                    <strong> {language == "en" ? "Email" : "E-Mail"}:</strong>{" "}
                    {formData.email}
                  </p>
                  <p>
                    <strong>{language == "en" ? "Date" : "Datum"}:</strong>{" "}
                    {format(formData.date, "PP")}
                  </p>
                  <p>
                    <strong>{language == "en" ? "Time" : "Uhrzeit"}:</strong>{" "}
                    {formData.time}
                  </p>
                  <p>
                    <strong>
                      {" "}
                      {language == "en" ? "Guests" : "Personen"}:
                    </strong>{" "}
                    {formData.numberOfGuests}
                  </p>
                </div>
              )}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="hover:bg-gray-100 transition-colors border-black"
                >
                  {language == "en" ? "Cancel" : "Abbrechen"}
                </Button>
                <Button
                  onClick={handleConfirmReservation}
                  disabled={loading}
                  className="bg-[#2e0a16] hover:bg-[#4a111f] transition-colors"
                >
                  {loading
                    ? language === "en"
                      ? "Submitting..."
                      : "Einreichen..."
                    : language === "en"
                    ? "Confirm Reservation"
                    : "Reservierung Bestätigen"}
                </Button>
              </div>
              {form.formState.errors.root && (
                <p className="text-red-500 text-sm mt-4 text-center">
                  {form.formState.errors.root.message}
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-6 p-4">
              <Clock size={80} className="text-yellow-500 animate-pulse" />
              <h2 className="text-2xl font-bold text-[#2e0a16] text-center">
                {language == "en"
                  ? "Thank you for your reservation request!"
                  : "Vielen Dank für Ihre Reservierungsanfrage!"}
              </h2>
              <div className="text-gray-600 text-center space-y-2">
                <p>
                  {language == "en"
                    ? "Your reservation request is being processed. We will review it shortly."
                    : "Ihre Reservierungsanfrage wird bearbeitet. Wir werden sie in Kürze prüfen."}
                </p>
                <p className="text-sm">
                  {language == "en"
                    ? "Your reservation request is being processed. You will receive a confirmation email soon."
                    : "Ihre Reservierungsanfrage wird bearbeitet. Sie erhalten bald eine Bestätigungs-E-Mail."}
                </p>
              </div>
              <Button
                onClick={handleCloseModal}
                className="bg-[#2e0a16] hover:bg-[#4a111f] transition-colors"
              >
                {language == "en" ? "Close" : "Schließen"}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export default ReserveTableForm;
