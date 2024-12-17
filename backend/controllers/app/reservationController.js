const Reservation = require("../../models/Reservation");
const sendEmail = require("../../config/mailer");

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
  }
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

    await sendEmail(
      "mandeepsingh227@yahoo.com",
      "You have received a new order",
      `Your table has been successfully reserved for ${formattedDate} at ${time}. We look forward to serving you!`
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
  console.log(status);

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
    console.log("reservations", reservations);

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

    res.status(200).json({
      status: "success",
      data: {
        reservation,
      },
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
      message: "Could not fetch reservation",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        status: "fail",
        message: "No reservation found with that ID",
      });
    }

    reservation.status = status;
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
        ? `Your table has been successfully reserved for ${formattedDate} at ${reservation.time}. We look forward to serving you!`
        : `Your table has been Canceled for ${formattedDate} at ${reservation.time}. We look forward to serving you!`;

    await sendEmail(
      reservation.email,
      status === "accepted"
        ? "Reservation Confirmed!"
        : "Reservation Canceled!",
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
