const Reservation = require("../../models/Reservation");
const sendEmail = require("../../config/mailer");
// const { default: puppeteer } = require("puppeteer");
const puppeteer = require("puppeteer");

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
  }
}

async function generatePDF(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();
  return pdfBuffer;
}

exports.createReservation = async (req, res) => {
  try {
    const { name, phone, email, date, time, numberOfGuests } = req.body;

    if (!name || !phone || !email || !date || !time || !numberOfGuests) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid input data",
        errors: errors,
      });
    }

    // Add one day to the date
    const adjustedDate = new Date(date);
    adjustedDate.setDate(adjustedDate.getDate() + 1);

    console.log("date", adjustedDate);

    const newReservation = await Reservation.create({
      name,
      phone,
      email,
      date: adjustedDate, // Use the adjusted date
      time,
      numberOfGuests,
      status: "pending",
    });

    const formattedDate = adjustedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailTemplate = `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
  <h2 style="text-align: center; color: #d35400;">Museum Restaurant</h2>
  <p><strong>Dear Museum Restaurant Team,</strong></p>
  <p>You have received a new table reservation through your website. Please find the details below:</p>
  <h4>Reservation Details:</h4>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><strong>Reservation Name:</strong></td>
      <td style="padding: 10px; border: 1px solid #ddd;">${
        newReservation.name
      }</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><strong>Phone Number:</strong></td>
      <td style="padding: 10px; border: 1px solid #ddd;">${
        newReservation.phone
      }</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
      <td style="padding: 10px; border: 1px solid #ddd;">${
        newReservation.email
      }</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date of Reservation:</strong></td>
      <td style="padding: 10px; border: 1px solid #ddd;">${new Date(
        newReservation.date
      ).toLocaleDateString("en-US")}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><strong>Time of Reservation:</strong></td>
      <td style="padding: 10px; border: 1px solid #ddd;">${
        newReservation.time
      }</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><strong>Number of Guests:</strong></td>
      <td style="padding: 10px; border: 1px solid #ddd;">${
        newReservation.numberOfGuests
      }</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;"><strong>Status:</strong></td>
      <td style="padding: 10px; border: 1px solid #ddd; text-transform: capitalize;">${
        newReservation.status
      }</td>
    </tr>
  </table>
  <h4>Special Requests (if any):</h4>
  <p style="padding: 10px; border: 1px solid #ddd;">None</p>
  <p>
    Please ensure the table is prepared in advance to provide an excellent dining experience. If there are any issues or the customer needs to be contacted, they can be reached at ${
      newReservation.phone
    }.
  </p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${
      process.env.DOMAIN
    }adminnavbar/pendingreservation" style="background-color: #d35400; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Table Reservations</a>
  </div>
  <p>Thank you,</p>
  <p><a href="${process.env.DOMAIN}">www.museum-restaurant-hechingen.de</a></p>
</div>
`;

    const pdfBuffer = await generatePDF(emailTemplate);

    await sendEmail(
      // "prakhargaba@gmail.com",
      "mandeepsingh227@yahoo.com",
      "New Table Reservation Received",
      "",
      emailTemplate,
      [{ filename: "ReservationDetails.pdf", content: pdfBuffer }]
    );

    res.status(201).json(newReservation);
  } catch (error) {
    console.log(error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        status: "fail",
        message: "Invalid input data",
        errors: errors,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

exports.getAllReservations = async (req, res) => {
  const { status } = req.body;
  // console.log(status);

  // Pagination parameters with defaults
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    let totalReservations;
    let reservations;
    // Count total matching reservations
    if (status) {
      totalReservations = await Reservation.countDocuments({ status });

      // Fetch paginated reservations
      reservations = await Reservation.find({ status })
        .skip(skip)
        .limit(limit)
        .sort({ date: 1 }); // Optional: sort by most recent first
    } else {
      totalReservations = await Reservation.countDocuments();

      // Fetch paginated reservations
      reservations = await Reservation.find()
        .skip(skip)
        .limit(limit)
        .sort({ date: 1 }); // Optional: sort by most recent first
    }
    // console.log("reservations", reservations);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalReservations / limit);

    res.status(200).json({
      status: "success",
      results: reservations.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalReservations,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: {
        reservations,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not fetch reservations",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

exports.getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        status: "fail",
        message: "No reservation found with that ID",
      });
    }

    res.status(200).json(reservation);
  } catch (error) {
    // Handle invalid ID error
    if (error.name === "CastError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid reservation ID",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Could not fetch reservation",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

exports.updateStatus = async (req, res) => {
  const { status, cancellationReason } = req.body;
  console.log("req.body", req.body);

  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        status: "fail",
        message: "No reservation found with that ID",
      });
    }

    reservation.status = status;
    reservation.cancellationReason = cancellationReason;
    await reservation.save();

    // Format the date and time
    const date = new Date(reservation.date);
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);

    const emailMessage =
      status === "accepted"
        ? `<body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <div style={{ marginBottom: 5 }}>
            <p>Sehr geehrte/r ${reservation.name},</p>
            <p>
              Vielen Dank, dass Sie sich für Museum Restaurant entschieden
              haben! Wir freuen uns, Ihre Tischreservierung zu bestätigen.
            </p>
            <p>Hier sind die Details Ihrer Reservierung:</p>
            <ul>
              <li>
                <strong>Name:</strong> ${reservation.name}
              </li>
              <li>
                <strong>Telefonnummer:</strong> ${reservation.phone}
              </li>
              <li>
                <strong>E-Mail:</strong> ${reservation.email}
              </li>
              <li>
                <strong>Datum:</strong> ${formattedDate}
              </li>
              <li>
                <strong>Uhrzeit:</strong> ${reservation.time}
              </li>
              <li>
                <strong>Anzahl der Personen:</strong> ${reservation.numberOfGuests}
              </li>
            </ul>
            <p>
              Wir freuen uns darauf, Sie in unserem Restaurant willkommen zu
              heißen und Ihnen ein wunderbares kulinarisches Erlebnis mit den
              Aromen Indiens zu bieten.
            </p>
            <p>
              Denken Sie auch an unsere Event- und Cateringservices für Ihre
              besonderen Anlässe.
            </p>
            <p>
              Vergessen Sie nicht, uns auf
              <a
                href="https://www.instagram.com/museum.hechingen/"
                target="_blank"
              >
                Instagram
              </a>
              und
              <a
                href="https://www.facebook.com/profile.php?id=61554941725773"
                target="_blank"
              >
                Facebook
              </a>
              zu folgen, um über Neuigkeiten, Angebote und exklusive Einblicke
              informiert zu bleiben. Wenn Ihnen Ihr Besuch gefallen hat, freuen
              wir uns über Ihre Bewertung auf
              <a href="https://maps.app.goo.gl/TJ4mFndY8oVkWHuG6" target="_blank">
                Google
              </a>
              .
            </p>
            <p>
              Weitere Informationen über uns finden Sie auf unserer Website:
              <a href="${process.env.DOMAIN}" target="_blank">
                Museum Restaurant
              </a>
              .
            </p>
            <p>
              Falls Sie Fragen haben, kontaktieren Sie uns bitte. Mit der
              Bestätigung Ihrer Reservierung stimmen Sie unserer
              Datenschutzerklärung zur elektronischen Verarbeitung und
              Speicherung Ihrer Daten zu.
            </p>
            <p>Herzliche Grüße,</p>
            <p>Ihr Museum Restaurant Team</p>
            <p>
              <strong>Adresse:</strong> Zollernstraße 2, 72379 Hechingen
            </p>
            <p>
              <strong>Telefon:</strong> +49747113015
            </p>
            <p>
              <strong>E-Mail:</strong>
              <a href="mailto:mandeepsingh227@yahoo.com">mandeepsingh227@yahoo.com</a>
            </p>
          </div>
          <div>
            <p>Dear Mr/Mrs. ${reservation.name},</p>
            <p>
              Thank you for choosing Museum Restaurant! We are delighted to
              confirm your table reservation.
            </p>
            <p>Here are the details of your reservation:</p>
            <ul>
              <li>
                <strong>Name:</strong> ${reservation.name}
              </li>
              <li>
                <strong>Phone Number:</strong> ${reservation.phone}
              </li>
              <li>
                <strong>Email:</strong> ${reservation.email}
              </li>
              <li>
                <strong>Date:</strong> ${formattedDate}
              </li>
              <li>
                <strong>Time:</strong> ${reservation.time}
              </li>
              <li>
                <strong>Number of Persons:</strong> ${reservation.numberOfGuests}
              </li>
            </ul>
            <p>
              We look forward to welcoming you to our restaurant and providing
              you with a wonderful dining experience filled with the flavors of
              India. Don’t forget to check out our event hosting and catering
              services for your special occasions.
            </p>
            <p>
              Don't forget to like and follow us on
              <a
                href="https://www.instagram.com/museum.hechingen/"
                target="_blank"
              >
                Instagram
              </a>
              and
              <a
                href="https://www.facebook.com/profile.php?id=61554941725773"
                target="_blank"
              >
                Facebook
              </a>
              for updates, offers, and exclusive insights. If you enjoyed your
              dining experience, we would greatly appreciate your feedback on
              Google
              <a href="https://google.com" target="_blank">
                Google
              </a>
              .
            </p>
            <p>
              For more information about us or to explore our services, visit
              our website:
              <a href="${process.env.DOMAIN}" target="_blank">
                Museum Restaurant
              </a>
              .
            </p>
            <p>
              If you have any questions, don't hesitate to contact us. By
              confirming your reservation, you have agreed to our Privacy Policy
              regarding the electronic processing and storage of your data.
            </p>
            <p>Warm Regards,</p>
            <p>Your Museum Restaurant Team</p>
            <p>
              <strong>Address:</strong> Zollernstraße 2, 72379 Hechingen
            </p>
            <p>
              <strong>Phone:</strong> +49747113015
            </p>
            <p>
              <strong>Email:</strong>
              <a href="mailto:mandeepsingh227@yahoo.com">mandeepsingh227@yahoo.com</a>
            </p>
          </div>
        </body>`
        : `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
  <h2 style="text-align: center; color: #d35400;">Museum Restaurant</h2>
  
  <!-- German Section -->
  <p><strong>Sehr geehrte/r ${reservation.name},</strong></p>
  <p>
    Vielen Dank, dass Sie sich für Museum Restaurant entschieden haben. Leider können wir Ihre Tischreservierung aus folgendem Grund nicht bestätigen:
  </p>
  <p style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">${reservation.cancellationReason}</p>
  <p>
    Wir entschuldigen uns aufrichtig für die entstandenen Unannehmlichkeiten und hoffen, Sie in Zukunft bei uns begrüßen zu dürfen.
  </p>
  <p>
    Falls Sie weitere Fragen haben oder eine alternative Buchung vornehmen möchten, kontaktieren Sie uns bitte unter:
    <strong>+49 7471 13016</strong> oder <strong>mandeepsingh227@yahoo.com</strong>
  </p>
  <p>Vielen Dank für Ihr Verständnis.</p>
  <p>Mit freundlichen Grüßen,</p>
  <p>Museum Restaurant</p>
  <p>
    Follow us on social media:<br>
    • <a href="https://www.facebook.com/profile.php?id=61554941725773" style="color: #d35400;">Facebook</a><br>
    • <a href="https://www.instagram.com/museum.hechingen/" style="color: #d35400;">Instagram</a>
  </p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

  <!-- English Section -->
  <p><strong>Dear ${reservation.name},</strong></p>
  <p>
    Thank you for choosing Museum Restaurant for your dining experience. Unfortunately, we are unable to confirm your table reservation for the following reason:
  </p>
  <p style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">${reservation.cancellationReason}</p>
  <p>
    We sincerely apologize for the inconvenience caused and hope to have the pleasure of serving you in the future.
  </p>
  <p>
    If you would like to discuss further or make an alternate booking, please contact us at:
    <strong>+49 7471 13016</strong> or <strong>mandeepsingh227@yahoo.com</strong>
  </p>
  <p>Thank you for your understanding.</p>
  <p>Warm regards,</p>
  <p>Museum Restaurant</p>
  <p>
    Follow us on social media:<br>
    • <a href="https://www.facebook.com/profile.php?id=61554941725773" style="color: #d35400;">Facebook</a><br>
    • <a href="https://www.instagram.com/museum.hechingen/" style="color: #d35400;">Instagram</a>
  </p>
</div>
`;

    await sendEmail(
      reservation.email,
      status === "accepted"
        ? "Ihre Tischreservierung ist bestätigt / Your Table Reservation is Confirmed"
        : "Reservierungs-Update von Museum Restaurant / Reservation Canceled!",
      "",
      emailMessage
    );

    res.status(200).json({
      status: "success",
      data: {
        reservation,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid reservation ID",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Could not fetch reservation",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// exports.updateReservation = async (req, res) => {
//   try {
//     const updatedReservation = await Reservation.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!updatedReservation) {
//       return res.status(404).json({
//         status: "fail",
//         message: "No reservation found with that ID",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       data: {
//         reservation: updatedReservation,
//       },
//     });
//   } catch (error) {
//     // Handle Mongoose validation errors
//     if (error.name === "ValidationError") {
//       const errors = Object.values(error.errors).map((err) => err.message);
//       return res.status(400).json({
//         status: "fail",
//         message: "Invalid input data",
//         errors: errors,
//       });
//     }

//     // Handle invalid ID error
//     if (error.name === "CastError") {
//       return res.status(400).json({
//         status: "fail",
//         message: "Invalid reservation ID",
//       });
//     }

//     res.status(500).json({
//       status: "error",
//       message: "Could not update reservation",
//       error:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : "Internal server error",
//     });
//   }
// };

exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        status: "fail",
        message: "No reservation found with that ID",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    // Handle invalid ID error
    if (error.name === "CastError") {
      return res.status(400).json({
        status: "fail",
        message: "Invalid reservation ID",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Could not delete reservation",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Export the AppError class if needed
exports.AppError = AppError;
