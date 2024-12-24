const jwt = require("jsonwebtoken");
// const otpGenerator = require("otp-generator");
// const Otp = require("../../../models/Otp");
const User = require("../../models/User");
// const Notification = require("../../../models/Notification");
const bcrypt = require("bcrypt");
require("dotenv");
const request = require("request");

const moment = require("moment");
const multer = require("multer");
const root = process.cwd();
const path = require("path");
const fs = require("fs");
const sendEmail = require("../../config/mailer");
// const { success } = require("handy-log");

// // Set The Storage Engine
const storage = multer.diskStorage({
  destination: path.join(root, "/public/uploads/profile"),
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}.jpg`);
  },
});

const imageFilter = (req, file, cb) => {
  // Accept only image files (JPEG, PNG, GIF)
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

// // Init Upload
const upload = multer({
  storage: storage,

  fileFilter: imageFilter,
}).single("image");

class AuthController {
  static login = async (req, res) => {
    const { mobile_number, email, password } = req.body;
    let msg = "Something went wrong, please try again later";
    console.log(req.body);

    // Check if either mobile number or email is provided
    if (!mobile_number && !email) {
      return res.status(400).send("Either Mobile Number or Email is required");
    }

    let user;
    try {
      // If a mobile number is provided, find the user by mobile number
      if (mobile_number) {
        // console.log("hello");

        var mobile_regex = /^\d{10}$/;
        // console.log("2hello");
        if (!mobile_regex.test(mobile_number)) {
          // console.log("3hello");
          return res.status(401).send("Invalid Mobile Number");
        }
        // console.log("4hello");
        user = await User.findOne({ mobile_number });
        // console.log("5hello");
      }

      // If an email is provided, find the user by email
      if (email && !user) {
        user = await User.findOne({ email });
      }

      if (!user) {
        return res.status(404).json({
          message: "User Does Not Exist",
          is_registered: false,
        });
      }

      if (!user.password) {
        return res.status(401).send({
          message: "Use Forgot Password to create a new password",
          forgot_pass: true,
        });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).send({ message: "Invalid Password" });
      }

      const token = jwt.sign(
        {
          _id: user._id,
        },
        process.env.TOKEN_SECRET
      );

      let data = {
        token: token,
        user: user,
        is_registered: true,
      };
      return res.status(200).json({
        message: "Login Successfully",
        success: true,
        data: data,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something Went Wrong" });
    }
  };

  //  static forgot_password = async (req, res) => {
  //     try {
  //       let mobile_number = req.body.mobile_number;
  //       let user = await User.findOne({ mobile_number});
  //       if(!user){
  //         return res.status(404).json({
  //           message: "User does not Exist",
  //           is_registered: false
  //         });
  //       }
  //       let newOtp =  otpGenerator.generate(4,{
  //         alphabets: false,
  //         upperCase: false,
  //         specialChars: false
  //       }
  //       )
  //       sendSMS(user.mobile_number,newOtp);
  //       const otpExist = await Otp.findOne({
  //         user,
  //       });

  //       if (otpExist) {
  //         await Otp.findOneAndUpdate(
  //           {
  //             _id: otpExist._id,
  //           },
  //           {
  //             otp: newOtp,
  //             update_at: Date.now(),
  //           }
  //         );
  //       } else {
  //         const otp = Otp({
  //           user,
  //           otp: newOtp,
  //           created_at: Date.now(),
  //           update_at: Date.now(),
  //         });
  //         await otp.save();
  //       }
  //       return res.status(200).json({message: "OTP sent successfully"});

  //     } catch (error) {
  //       console.log(error);
  //       return res.status(400).json({message: "Something Went Wrong"})
  //     }
  //   }
  //   static otp_verify = async (req, res) => {
  //     try {
  //       let mobile_number = req.body.mobile_number;
  //       let password = req.body.password;
  //       let otp = req.body.otp;

  //       if (mobile_number == "") {
  //         return res.send("Mobile Number is required");
  //       } else if (otp == "") {
  //         return res.send("Otp is required");
  //       }

  //       const user = await User.findOne({
  //         mobile_number: mobile_number,
  //       });
  //       // console.log(user)
  //       if (!user) return res.send("User not found");

  //       const verify = await Otp.findOne({
  //         user,
  //       });
  //       let is_registered = 0;
  //       if (user && user.mobile_number && user.mobile_number != "") {
  //         is_registered = 1;
  //       }
  //       // return console.log(verify)
  //       if (otp == verify.otp) {
  //         user.password = await bcrypt.hash(password,await bcrypt.genSalt(Number(process.env.SALT_ROUNDS)));
  //         user.save();
  //         const token = jwt.sign(
  //           {
  //             _id: user._id,
  //           },
  //           process.env.TOKEN_SECRET
  //         );
  //         let data = {
  //           token: token,
  //           is_registered: is_registered,
  //         };
  //         return res.status(200).json({
  //           message: "Password Updated Successfully",
  //           status: 200,
  //           success: true,
  //           data: data,
  //         });
  //       }
  //       return res.send("Invalid Otp");
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  static register = async (req, res) => {
    try {
      var registerData = req.body;
      console.log("registerData", registerData);

      // Handle guest registration
      if (registerData.type === "guest") {
        const randum = Math.floor(Math.random() * 1000000000);
        // Generate a random guest name
        console.log(randum);

        console.log("guest");

        registerData.name = `Guest_${randum}`;

        // Optional: You might want to skip other validations for guests
        registerData.email =
          registerData.email ||
          `guest_${Math.floor(Math.random() * 10000)}@example.com`;
        registerData.mobile_number = registerData.mobile_number || randum;
        registerData.password =
          registerData.password || Math.random().toString(36).slice(-8);
      }

      const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
      const hashedPassword = await bcrypt.hash(registerData.password, salt);

      // Only check for existing user if not a guest or if email is provided
      if (registerData.type !== "guest" || registerData.email) {
        let user = await User.findOne({
          email: registerData.email,
        });

        if (!!user) {
          return res.status(401).json({
            message: "User Already Exists!",
            is_registered: true,
            success: false,
          });
        }
      }

      let data = await User({
        name: registerData.name,
        email: registerData.email || "",
        password: hashedPassword,
        mobile_number: registerData.mobile_number || "",
        type: registerData.type,
        role: registerData.role,
        approved: true,
      });

      console.log("data", data);

      await data.save();

      const token = jwt.sign(
        {
          _id: data._id,
        },
        process.env.TOKEN_SECRET
      );

      let returnObj = {
        statusCode: 200,
        success: true,
        message: "User Registered Successfully",
        data: {
          token: token,
          user: data,
          is_registered: 1,
        },
      };

      res.status(200).json(returnObj);
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .send("Something went wrong please try again later");
    }
  };

  static profile_update = async (req, res) => {
    let msg = "Something went wrong please try again later";
    try {
      upload(req, res, async function (err) {
        var token = req.body.token;

        const payload = jwt.decode(token, process.env.TOKEN_SECRET);
        const user = await User.findById(payload._id);
        if (!user) return res.status(401).send("User not found");

        let data = {
          image: req.file ? req.file.filename : "",
          name: req.body.name ? req.body.name : "",
          email: req.body.email ? req.body.email : "",
          account_holder_name: req.body.account_holder_name
            ? req.body.account_holder_name
            : "",
          account_number: req.body.account_number
            ? req.body.account_number
            : "",
          ifsc_code: req.body.ifsc_code ? req.body.ifsc_code : "",
          bank_name: req.body.bank_name ? req.body.bank_name : "",
          branch: req.body.branch ? req.body.branch : "",
          phonePe_no: req.body.phonePe_no ? req.body.phonePe_no : "",
          googlePay_no: req.body.googlePay_no ? req.body.googlePay_no : "",
          paytm_no: req.body.paytm_no ? req.body.paytm_no : "",
        };

        let data1 = {};
        for (let i in data) {
          if (data[i] != "") {
            // data1.push({
            //     [i]: data[i]
            // });
            data1[i] = data[i]; // json object
          }
        }

        const profile = await User.findOne({
          _id: user._id,
        });
        await User.findOneAndUpdate(
          {
            _id: profile._id,
          },
          { $set: data1 }
        );

        let Data1 = await profile.save();
        // sending notification start
        const notification = Notification({
          user: req.id,
          type: "Profile Updated",
          data: {
            time: Date.now(),
          },
        });
        await notification.save();
        if (req.app.socket) req.app.socket.emit("Profile Updated");

        // sending notification end
        return res.status(201).send({
          message: "profile Update Successfully",
          status: true,
          success: true,
          data: Data1,
        });
      });
    } catch (error) {
      console.log(error);
      return res.status(401).send(msg);
    }
  };

  static get_user_profile = async (req, res) => {
    let msg = "Something went wrong please try again later";
    console.log("hello");

    try {
      // var token = req.body.token;
      const userId = req.userId;
      // const payload = jwt.decode(token, process.env.TOKEN_SECRET);
      const user = await User.findById(userId);
      if (!user) return res.status(401).send("User not found");

      res.send(user);
    } catch (error) {
      console.log(error);
      return res.status(401).send(msg);
    }
  };

  static isAdmin = async (req, res) => {
    let msg = "Something went wrong please try again later";
    const userId = req.userId;

    try {
      const user = await User.findOne({ _id: userId, role: "admin" });
      if (!user) return res.status(401).send("Admin not found");

      res.send(user);
    } catch (error) {
      console.log(error);
      return res.status(401).send(msg);
    }
  };

  static sample = async (req, res) => {
    let msg = "Something went wrong please try again later";

    try {
      await sendEmail(
        "prakhargaba@gmail.com",
        "helo9o",
        "",
        `<p>Sehr geehrte/r [XXXX],</p>
    <p>Vielen Dank, dass Sie sich für Museum Restaurant entschieden haben! Wir freuen uns, Ihre Tischreservierung zu bestätigen.</p>
    <p>Hier sind die Details Ihrer Reservierung:</p>
    <ul>
        <li><strong>Name:</strong> [XXXX]</li>
        <li><strong>Telefonnummer:</strong> [XXXX]</li>
        <li><strong>E-Mail:</strong> [XXXX]</li>
        <li><strong>Datum:</strong> [XXXX]</li>
        <li><strong>Uhrzeit:</strong> [XXXX]</li>
        <li><strong>Anzahl der Personen:</strong> [XXXX]</li>
    </ul>`
      );
      res.send("Email sent successfully.");
    } catch (error) {
      console.log(error);
      return res.status(401).send(msg);
    }
  };
}

module.exports = AuthController;
