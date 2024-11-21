/**
* @file Code to setup stuff before and after all vitest 
*/

import { beforeAll, afterAll, vi } from 'vitest';
import { MongoClient } from 'mongodb';
import { db, connectToDatabase, setDb, closeConnection } from './db/connection.js';
import express from 'express';
import { fileURLToPath } from 'node:url';

let app;
let connection;
let usersCollection;
let tokensCollection;
let projectsCollection;

// This is done before each block of "it"
beforeAll(async () => {
  // Skip test setup for connection.js
  if (fileURLToPath(import.meta.url).includes('connection.js')) {
    return;
  }

  vi.stubEnv('DATABASE_NAME', 'test')

  // In test environment, connection.js does not set the db
  setDb(await connectToDatabase());

  usersCollection = db.collection('users');  // Access the users collection
  tokensCollection = db.collection('tokens'); // Access the tokens collection
  projectsCollection = db.collection('projects'); // Access the projects collection

  app = express();
  app.use(express.json());

  console.log('Test setup is done!')
});

afterAll(async () => {
  // Skip test setup for connection.js
  if (fileURLToPath(import.meta.url).includes('connection.js')) {
    return;
  }
  
  await usersCollection.deleteMany({});
  await tokensCollection.deleteMany({});
  await projectsCollection.deleteMany({});

  const adminUser = {
    userName : "admin3900",
    email : "demouser@example.com",
    password : "$2a$10$gcZXQl3fj2qvnAxFyZkZROLZtMrOTuzv.StOfgMU/MQFvyLDlH1gC", // sleepy
    permission : 1
  }
  await usersCollection.insertOne(adminUser);
  
  await closeConnection();
  vi.unstubAllEnvs();
  console.log('Test cleanup is done!')
});

export {app, connection, usersCollection, tokensCollection, projectsCollection};