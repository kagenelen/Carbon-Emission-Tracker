/**
* @file Routes relating to resetting a forgotten password
* @route post/request-password-reset
* @route post/:userId/:token
*/

import express from 'express';
import { db } from "../db/connection.js";  // MongoDB connection lifecycle
import bcrypt from 'bcryptjs';  // Password hashing
import crypto from 'crypto'; // Token generation
import mongodb, { ConnectionClosedEvent } from 'mongodb';
import sendEmail from '../utils/send_email.js';

const router = express.Router();
const EXPIRY = 3600000; // 1 hour, in milliseconds

/** 
* Route serving forgot password form. Creates password reset token and sends email.
* @name post/request-password-reset
* @param {string} email - Email of user
* @returns {object} res.body.{message}
*/
router.post("/request-password-reset", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);

    // Validate the input data
    if (!email) {
      return res.status(400).json({ message: "Enter a valid email." });
    }

    const usersCollection = await db.collection("users");
    const tokensCollection = await db.collection("tokens");

    // Check if the email belongs to a registered user
    const existingUser = await usersCollection.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "No user is registered with this email." });
    }

    // Create password reset token
    let token = await tokensCollection.findOne({ userId: existingUser._id });
    if (token) {
      // Delete existing token
      await tokensCollection.deleteOne(token);
    }

    const newToken = {
      userId: existingUser._id,
      token: crypto.randomBytes(32).toString("hex"),
      expiresAt: Date.now() + EXPIRY,
    };

    // Insert the new token into the database
    // This is placed before sending email to allow invalid emails for testing
    await tokensCollection.insertOne(newToken);

    // Return success response (placed before send email to reduce delay on frontend)
    res.status(202).json({ message: "Password reset email successfully sent" });

    // Send email to user
    const link = `${process.env.WEB_URL}/${existingUser._id}/${newToken.token}/login`;
    const emailMessage = (`
    Hello ${existingUser.name},

    We're sending you this email because you requested a password reset.
    Click on this link to reset your password:
    ${link}
    `);
    await sendEmail(email, "Rubbles to Renewal - Password Reset", emailMessage);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending password reset email" });
  }
});

/** 
* Route serving password reset links from email. Verifies token and changes email in database.
* @name post/:userId/:token
* @param {string} userId - Requesting user's id
* @param {string} token - Request token to be verified
* @param {string} password - New password
* @returns {object} res.body.{message}
*/
router.post("/:userId/:token", async (req, res) => {
  try {
    const { password } = req.body;

    const usersCollection = await db.collection("users");
    const tokensCollection = await db.collection("tokens");

    const userIdObj = new mongodb.ObjectId(req.params.userId);
    const user = await usersCollection.findOne({ _id: userIdObj });
    if (!user) return res.status(400).send("Password reset link is invalid.");

    // Check token validity
    const token = await tokensCollection.findOne({
      userId: user._id,
      token: req.params.token
    });

    if (!token) {
      return res.status(400).json({ message: "Password reset link is invalid."});
    } else if (token.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Password reset link is expired."});
    }

    // Update password and delete token
    const hashedPassword = await bcrypt.hash(password, 10);
    await usersCollection.updateOne({_id: user._id}, {$set:{password:hashedPassword}});
    await tokensCollection.deleteOne(token);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
    console.log(error);
  }
});


export default router;
