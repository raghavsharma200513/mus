const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, body) => {
  return new Promise((resolve, reject) => {
    // Create transporter using Hostinger SMTP settings
    var transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com", // Hostinger SMTP server
      port: 465, // Secure SSL/TLS port
      secure: true, // Use SSL
      auth: {
        user: "no-reply@taczclub.com",
        pass: "Test@1105",
      },
    });

    var mailOptions = {
      from: "no-reply@taczclub.com", // Use the Hostinger email
      to: to, // Dynamic recipient
      subject: subject,
      text: body,
      // Optionally, you can add HTML email support
      // html: body // Uncomment if you want to send HTML emails
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Email sending error:", error);
        reject(error); // Changed to reject for better error handling
      } else {
        console.log("Email sent successfully: " + info.response);
        resolve(true);
      }
    });
  });
};

module.exports = sendEmail;
