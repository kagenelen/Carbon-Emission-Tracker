/**
* @file Route to change email
* @route post/confirm_email/:userIdParam?
*/

import express from 'express';
import { db } from "../db/connection.js";  // MongoDB connection lifecycle
import { auth_middleware } from '../utils/jwt_session.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

/** 
* Route serving change email form. Changes email in the database.
* @name post/confirm_email
* @param {string} email - New email
* @param {string} newEmail - Confirm new email
* @returns {object} res.body.{message}
*/
router.post("/confirm_email/:userIdParam?", auth_middleware, async (req, res) => {
  try {
    const userId = req.params.userIdParam || req.user.userId;
    const userIdObj = new ObjectId(userId);
    const { newEmail } = req.body;

    // Validate the input data
    if (!newEmail) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const collection = db.collection("users");

    // Check if the user exists
    const user = await collection.findOne({ _id: userIdObj });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Check if the new email is already registered
    const existingUser = await collection.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ message: "This email is already in use" });
    }

    // Update the user's email
    await collection.updateOne({ _id: userIdObj }, { $set: { email: newEmail } });

    // Return email update response
    res.status(200).json({ message: "Email updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating email" });
  }
});

export default router;
