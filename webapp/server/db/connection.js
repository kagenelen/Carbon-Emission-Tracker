/**
* @file Deals with connecting and disconnecting from Mongo database
*/

import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../config.env') })

let URI = process.env.ATLAS_URI;

const client = new MongoClient(URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const getClient = () => {
  if (!client) {
    client = new MongoClient(URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    }); 
  }
  return client;
};

// Function to connect to MongoDB
export const connectToDatabase = async () => {
  const client = getClient();
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    // console.log("Successfully connected to MongoDB at database: " + process.env.DATABASE_NAME);
    return client.db(process.env.DATABASE_NAME);
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    throw err;
  }
};

// Function to close the connection
export const closeConnection = async () => {
  if (client) {
    try {
      await client.close();
      // console.log("MongoDB connection closed.");
    } catch (err) {
      console.error("Failed to close MongoDB connection", err);
      throw err;
    }
  }
};

// Function to allow test-setup.js to set db value
export const setDb = (newDb) => {
  db = newDb
}

export let db;
if (process.env.DATABASE_NAME != 'test') {
  // Do not set db if it is a test environment
  db = await connectToDatabase();
}
