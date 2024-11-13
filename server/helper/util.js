  import config from "config";
import jwt from "jsonwebtoken";
const fs = require("fs");
import FCM from "fcm-push";
import AWS from "aws-sdk";
import ses from "node-ses";
import mailTemplet from "../helper/mailtemplet";


var nodemailer_sender_email = "no-reply@tecnobelite.com";

import cloudinary from "cloudinary";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: config.get("nodemailer.service"),
  auth: {
    user: config.get("nodemailer.email"),
    pass: config.get("nodemailer.password"),
  },
});


// const transporter = nodemailer.createTransport({
//   host: 'smtpout.secureserver.net',
//   port: 587, // or 465 if you prefer SSL
//   secure: false, // true for port 465, false for other ports
//   auth: {
//     user: 'you@yourdomain.com', // your GoDaddy email
//     pass: 'your-email-password', // your GoDaddy email password
//   },
// });


const accountSid = config.get("twilio.accountSid");
const authToken = config.get("twilio.authToken");
const client = require("twilio")(accountSid, authToken);

const s3 = new AWS.S3({
  accessKeyId: config.get("AWS.accessKeyId"),
  secretAccessKey: config.get("AWS.secretAccessKey"),
});

const serverKey = config.get("pushNotificationServerkey");
const fcm = new FCM(serverKey);

module.exports = {
  getOTP() {
    var otp = Math.floor(1000 + Math.random() * 9000);
    return otp;
  },

  dateTime() {
    var today = new Date(
      new Date() - new Date().getTimezoneOffset() * 60 * 1000
    ).toISOString();
    var check = "";
    check = today.split(".")[0].split("T");
    var time = check[1].split(":")[0] > "11" ? " PM" : " AM";
    check = check[0].split("-").reverse().join("/") + " " + check[1] + time;
    return check;
  },

  makeReferral() {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },

  getToken: async (payload) => {
    var token = await jwt.sign(payload, config.get("jwtsecret"), {
      expiresIn: "3d",
    });
    return token;
  },

  sendMail: async (to, subject, body) => {
    const msg = {
      to: to, // Change to your recipient
      from: "no-replymailer@mobiloitte.com", // Change to your verified sender
      subject: subject,
      text: body,
    };
    sgMail
      .send(msg)
      .then((response) => {
        console.log(response[0].statusCode);
        console.log(response[0].headers);
      })
      .catch((error) => {
        console.error(error);
      });
  },

  getImageUrl: async (files) => {
    var mediaURL;
    var date = new Date().getTime();
    const fileContent = fs.readFileSync(files[0].path);
    const params = {
      Bucket: config.get("AWS.bucketName"),
      ContentType: files[0].mimetype,
      Key: `uploads/${date}${files[0].filename}`,
      Body: fileContent,
    };
    let data = await s3.upload(params).promise();
    console.log(`File uploaded successfully. ${data.Location}`);
    mediaURL = data.Location;
    return mediaURL;
  },

  getSecureUrl: async (base64) => {
    var result = await cloudinary.v2.uploader.upload(base64, {
      resource_type: "auto",
    });
    return result.secure_url;
  },

  uploadImage(image) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(image, function (error, result) {
        if (error) {
          reject(error);
        } else {
          console.log("result===>>", result.url);
          resolve(result.url);
        }
      });
    });
  },

  sendSmsTwilio: async (mobileNumber, otp) => {
    try {
      return await client.messages.create({
        body: `Your mobile One Time Password (OTP) to log in to your digital bank account is ${otp}.The OTP is valid for 3 minutes.`,
        to: mobileNumber,
        from: config.get("twilio.number"),
      });
    } catch (error) {
      console.log("160 ==>", error);
    }
  },

  //************************************ PUSH NOTIFICATIONS ************************************************************ */

  pushNotification: (deviceToken, subject, body, callback) => {
    var message = {
      to: deviceToken, // required fill with device token or topics
      content_available: true,
      notification: {
        subject: subject,
        // title: title,
        body: body,
      },
    };
    fcm.send(message, function (err, response) {
      if (err) {
        console.log("err", err);
        callback(err, null);
      } else {
        console.log("response", response);
        callback(null, response);
      }
    });
  },

  pushNotificationDelhi: (deviceToken, title, body, callback) => {
    var message = {
      to: deviceToken, // required fill with device token or topics
      content_available: true,
      notification: {
        // subject: subject,
        title: title,
        body: body,
      },
      data: {
        title: title,
        body: body,
      },
    };
    fcm.send(message, function (err, response) {
      if (err) {
        console.log("err", err);
        callback(err, null);
      } else {
        console.log("response", response);
        callback(null, response);
      }
    });
  },

  // ************************************ MAIL FUNCTIONALITY WITH NODEMAILER *****************************************************/

  sendMailOtp: async (email, otp) => {
    try {
      // Send email
      await transporter.sendMail({
        from: nodemailer_sender_email,
        to: email,
        subject: "ACCOUNT VERIFICATION",
        html: mailTemplet.signUpTemplet(otp),
        text: "plain text",
      });

      console.log("Email sent successfully");
      return "Email sent";
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },

  newsLetterSendEmail: async (email) => {
    try {
      // Send email
      const info = await transporter.sendMail({
        from: nodemailer_sender_email,
        to: email,
        subject: "Subscribe to Newsletter",
        html: mailTemplet.subscribertemplet(email),
        text: "plain text",
      });

      console.log("Email sent successfully:", info);
      return "Email sent";
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },

  replyNewsLetterSendEmail: async (email, message) => {
    try {
      // Send email
      const info = await transporter.sendMail({
        from: nodemailer_sender_email,
        to: email,
        subject: "Subscribe to Newsletter",
        html: mailTemplet.replyNewsLetterTemplet(email, message),
        text: "plain text",
      });

      console.log("Email sent successfully:", info);
      return "Email sent";
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },

  sendMailKYCapprove: async (email, body) => {
    try {
      // Send email
      const info = await transporter.sendMail({
        from: nodemailer_sender_email,
        to: email,
        subject: "KYC STATUS",
        html: mailTemplet.mailKYCApproveTemplet(body),
        text: "plain text",
      });

      console.log("Email sent successfully:", info);
      return "Email sent";
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },

  sendMailKYCreject: async (email, body) => {
    try {
      // Send email
      const info = await transporter.sendMail({
        from: nodemailer_sender_email,
        to: email,
        subject: "KYC STATUS",
        html: mailTemplet.mailKYCRejectTemplet(body),
        text: "plain text",
      });

      console.log("Email sent successfully:", info);
      return "Email sent";
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },

  sendMailSendMoney: async (email, url) => {
    try {
      // Send email
      const info = await transporter.sendMail({
        from: nodemailer_sender_email,
        to: email,
        subject: "PAYMENT VERIFY",
        html: mailTemplet.sendMoneyMailTemplet(url),
        text: "plain text",
      });

      console.log("Email sent successfully:", info);
      return "Email sent";
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },

  sendMailOtpForgetAndResendAWS: async (email, otp) => {
    try {
      // Send email
      const info = await transporter.sendMail({
        from: nodemailer_sender_email,
        to: email,
        subject: "ACCOUNT VERIFICATION",
        html: mailTemplet.otpForgetResetTemplet(otp),
        text: "plain text",
      });

      console.log("Email sent successfully:", info);
      return "Email sent";
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },

  sendMailStakeReject: async (email, body) => {
    try {
      // Send email
      const info = await transporter.sendMail({
        from: nodemailer_sender_email,
        to: email,
        subject: "STAKE STATUS",
        html: mailTemplet.mailStackRejectTemplet(body),
        text: "plain text",
      });

      console.log("Email sent successfully:", info);
      return "Email sent";
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },

  sendMailStakeAccept: async (email, body) => {
    try {
      // Send email
      const info = await transporter.sendMail({
        from: nodemailer_sender_email,
        to: email,
        subject: "STAKE STATUS",
        html: mailTemplet.mailStackAcceptTemplet(body),
        text: "plain text",
      });

      console.log("Email sent successfully:", info);
      return "Email sent";
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },
};
