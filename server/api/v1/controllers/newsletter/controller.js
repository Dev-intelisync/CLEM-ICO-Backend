// routes/newsletterRoutes.js
import express from "express";
import Newsletter from "./newsLetter.js";
import nodemailer from "nodemailer";
import Joi from "joi";
import config from "config";

// Joi validation schema
const subscriptionSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().required(),
});

const subscribeNewsLetter = async (req, res) => {
  try {
    // Validate request body
    const { error } = subscriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email } = req.body;

    // Check if the email is already subscribed
    const existingSubscription = await Newsletter.findOne({ email });
    if (existingSubscription) {
      return res.status(400).json({ message: "Email is already subscribed." });
    }
    // Save the new subscription to the database
    const newSubscription = new Newsletter({
      name,
      email, 
    });

    await newSubscription.save();

    // Send thank-you email to the user
    const transporter = nodemailer.createTransport({
      service: config.get("nodemailer.service"),
      auth: {
        user: config.get("nodemailer.email"),
        pass: config.get("nodemailer.password"),
      },
    });

    const userThankYouMailOptions = {
      from: "piyush@intelisync.ai", // your email
      to: email,
      subject: "Thank You for Subscribing!",
      text: `Hello ${name},\n\nThank you for subscribing to our newsletter! We appreciate your interest and will keep you updated with our latest news and updates.\n\nBest regards,`,
    };

    await transporter.sendMail(userThankYouMailOptions);

    res.status(201).json({
      message:
        "Subscribed to the newsletter successfully. Thank you email sent.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Unsubscribe from Newsletter
const unSubscribeNewsLetter = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email is subscribed
    const existingSubscription = await Newsletter.findOne({ email });
    if (!existingSubscription) {
      return res
        .status(404)
        .json({ message: "Email is not subscribed to the newsletter." });
    }

    // Remove the subscription from the database
    let data = await Newsletter.deleteOne({ _id: existingSubscription._id });

    res
      .status(200)
      .json({ message: "Unsubscribed from the newsletter successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Subscribed Emails
const subscribedEMailID = async (req, res) => {
  try {
    const subscribedEmails = await Newsletter.find().select("email");

    res.status(200).json({ subscribedEmails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  unSubscribeNewsLetter,
  subscribeNewsLetter,
  subscribedEMailID,
};
