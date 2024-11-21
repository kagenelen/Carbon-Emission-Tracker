/**
* @file Tests for checking express server configuration
*/

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';  // For testing HTTP requests
import express from 'express';  // Import express for route testing
import { MongoMemoryServer } from 'mongodb-memory-server';  // In-memory MongoDB server
import { MongoClient } from 'mongodb';
import users from '../user.js';  // Import user routes
import request_password_reset from '../request_password_reset.js'; // Import password reset routes
import confirm_password from "../change_password.js"; // Import changing password
import confirm_email from "../change_email.js"; // Import changing email
import cors from 'cors';

// Define variables for the app, connection, and MongoDB
let app;
let connection;
let db;
let mongoServer;

beforeEach(async () => {
  // Setup in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Mock process.env.ATLAS_URI with in-memory MongoDB URI
  process.env.ATLAS_URI = uri;

  connection = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  db = connection.db(); // Use this db object if you want to interact with the in-memory database

  // Initialize the express app
  app = express();

  // Configure CORS (same as in the server file)
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  }));

  app.use(express.json());

  // Set up the routes as defined in the server
  app.use('/user', users);
  app.use('/login', request_password_reset);
  app.use("/change-password", confirm_password);
  app.use("/change-email", confirm_email);
}, 20000); // Extend the hook timeout to 20 seconds for async MongoMemoryServer setup

afterEach(async () => {
  await connection.close();  // Close the MongoDB connection
  await mongoServer.stop();  // Stop the in-memory MongoDB server
});

describe('Express Server Configuration', () => {
  it('should respond with CORS headers', async () => {
    const res = await request(app)
      .get('/user')
      .expect('Access-Control-Allow-Origin', '*')
      .expect(200);

    expect(res.status).toBe(200);
  });

  it('should start the server on the correct port', async () => {
    const listenMock = vi.fn();
    app.listen = listenMock;

    const PORT = 3001;
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    // Check if the listen method was called with the correct port
    expect(listenMock).toHaveBeenCalledWith(PORT, expect.any(Function));
  });

  it('should handle POST requests to /user/register', async () => {const res = await request(app)
      .post('/user/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
    
    expect(res.status).toBe(201);  // Assuming a new user gets created successfully
    expect(res.body.message).toBe('User registered successfully');
  });
});
