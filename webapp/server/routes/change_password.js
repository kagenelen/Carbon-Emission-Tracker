/**
* @file Route to change password (password NOT forgotten)
* @route post/confirm_password
*/

import express from 'express';
import { db } from "../db/connection.js";  // MongoDB connection lifecycle
import bcrypt from 'bcryptjs';  // Password hashing
import { auth_middleware } from '../utils/jwt_session.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

/** 
* Route serving change password form. Changes password in the database.
* @name post/confirm_email
* @param {string} userId - User's id
* @param {string} password - Old password
* @param {string} newPassword - New password
* @returns {object} res.body.{message}
*/
router.post("/confirm_password", auth_middleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password, newPassword } = req.body;

    // Validate the input data
    if (!password || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const collection = db.collection("users");

    // Find the user by id
    const userIdObj =  new ObjectId(userId)
    const existingUser = await collection.findOne({ _id: userIdObj });
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the current password is correct (add this validation if necessary)
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update the user's password
    await collection.updateOne({ _id: userIdObj }, { $set: { password: hashedNewPassword } });

    // Return password update response
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating password" });
  }
});

export default router;
