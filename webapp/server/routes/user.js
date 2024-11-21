/**
* @file Routes relating to user operations
* @route post/register
* @route post/login
* @route delete/delete-user
* @route get/get-all-users
* @route get/get-user/:userId
*/

import express from 'express';
import { db } from "../db/connection.js";  // MongoDB connection methods
import bcrypt from 'bcryptjs';  // Password hashing
import { create_jwt, decode_jwt } from '../utils/jwt_session.js';
import mongodb from 'mongodb';
import { auth_middleware } from '../utils/jwt_session.js';

const router = express.Router();
const PERMISSION_ADMIN = 1;
const PERMISSION_USER = 0;

router.get('/', (req, res) => {
  res.status(200).send('User route working!');
});

/** 
* Route serving registration form. Inserts new user into database.
* @name post/register
* @param {string} name - Name of new user
* @param {string} email - Email of new user
* @param {string} password - Password of new user
* @returns {object} res.body.{message, userId}
*/
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate the input data
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the email is already registered
    const collection = db.collection("users");
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user document
    const newUser = {
      name,
      email,
      password: hashedPassword,
      permission: PERMISSION_USER
    };

    // Insert the new user into the database
    const result = await collection.insertOne(newUser);

    // Create JWT session token to immediately login the user
    const token = create_jwt(result.insertedId.toString(), name, PERMISSION_USER);

    // Return success response
    res.status(201).json({ message: "User registered successfully", userId: result.insertedId.toString(), jwtToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering user" });
  } 
});

/** 
* Route serving login form. Creates session token.
* @name post/login
* @param {string} name - Name of user
* @param {string} password - Password of user
* @returns {object} res.body.{message, jwtToken}
*/
router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;

    // Validate the input data
    if (!name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the account exists
    const collection = await db.collection("users");
    const existingUser = await collection.findOne({ name });
    if (!existingUser) {
      return res.status(400).json({ message: "User \'" + name + "\' does not exist" });
    }

    //Compare password to stored password
    const hashedPassword = await existingUser.password;
    const passMatch = await bcrypt.compare(password, hashedPassword);

    if (!passMatch) {
      return res.status(400).json({ message: "Incorrect password"})
    }
    
    // User is authenticated, now create JWT session token
    const token = create_jwt(existingUser._id, existingUser.name, existingUser.permission);

    // Return success response
    res.status(200).json({ message: "Login successful", jwtToken: token, permission: existingUser.permission});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
  }
});

/** 
* Route to delete user. Removes user and their related data from database.
* @name delete/delete-user
* @param {string} email - Email of user
* @returns {object} res.body.{message}
*/
router.delete("/delete-user", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the account exists
    const usersCollection = await db.collection("users");
    const existingUser = await usersCollection.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: email + " is not registered." });
    }

    // Delete all user's projects
    const projectsCollection = await db.collection("projects");
    await projectsCollection.deleteMany({ userId: existingUser._id })

    await usersCollection.deleteOne(existingUser);

    // Return success response
    res.status(200).json({ message: "Deletion successful"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting user" });
  }
});

/** 
 * Route to retrieve list of all users
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} res.body - JSON response containing a message and, if successful, the list of users
 * @throws {403} If user does not have admin permissions
 * @throws {500} If an error occurs while retrieving users
 */
router.get("/get-all-users", auth_middleware, async (req, res) => {
  try {
    // Check whether user is an admin
    if (!req.user.permission) {
      res.status(403).json({ message: "User does not have admin permissions." });
      return;
    }

    const userId = req.user.userId;
    const collection = db.collection("users");

    const users = await collection.find().toArray();

    res.status(200).json({ message: "Users retrieved successfully.", users });
  } catch (err) {
    console.error('Error retrieving users:', err);
    res.status(500).json({ message: "Failed to retrieve users." });
  }
});


/** 
 * Route to retrieve details of one user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} res.body - JSON response containing a message and, if successful, specified user
 * @throws {403} If user does not have admin permissions
 * @throws {500} If an error occurs while retrieving users
 */
router.get("/get-user/:userId", auth_middleware, async (req, res) => {
  try {
    // Check whether user is an admin
    if (!req.user.permission) {
      res.status(403).json({ message: "User does not have admin permissions." });
      return;
    }
  
    const userId = req.params.userId;
    const collection = db.collection("users");

    const users = await collection.findOne({ _id: new mongodb.ObjectId(userId)});

    res.status(200).json({ message: "User retrieved successfully.", users });
  } catch (err) {
    console.error('Error retrieving user:', err);
    res.status(500).json({ message: "Failed to retrieve user." });
  }
});

export default router;
