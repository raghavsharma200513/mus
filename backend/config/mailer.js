const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, body, html, attachments = []) => {
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
      from: "no-reply@taczclub.com",
      to: to,
      subject: subject,
      text: body,
      html: html,
      attachments: attachments, // Add attachments array to mail options
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Email sending error:", error);
        reject(error);
      } else {
        console.log("Email sent successfully: " + info);
        resolve(true);
      }
    });
  });
};

module.exports = sendEmail;
