/**
* @file Helper function for tests
* @function create_user
*/

import { create_jwt } from '../../utils/jwt_session.js';
import { ObjectId } from 'mongodb';

export const invalidToken = 'eyJjbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzFlZjQ3ZTA3ODRlNWRkMzc3ODQ0YTIiLCJ1c2VyTmFtZSI6ImN5cHJlc3MgdXNlciIsInBlcm1pc3Npb24iOjEsImlhdCI6MTczMDA4MTkxOCwiZXhwIjoxOTMwMTY4MzE4fQ.JYC8jLb_tuE3cVN8X6qsscvZiUa-KpNOqpLZNY7wKLs';
export const validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzFlZjQ3ZTA3ODRlNWRkMzc3ODQ0YTIiLCJ1c2VyTmFtZSI6ImN5cHJlc3MgdXNlciIsInBlcm1pc3Npb24iOjEsImlhdCI6MTczMDA4MTkxOCwiZXhwIjoxOTMwMTY4MzE4fQ.JYC8jLb_tuE3cVN8X6qsscvZiUa-KpNOqpLZNY7wKLs";

/** 
* Test helper function to create user directly in database
* @param {collection} collection - User Collection 
* @param {string} email - Default 'test@example.com'
* @param {string} name - Default 'John'
* @param {string} password - Default unencrypted 'password123'
* @returns {object} { userId(string), userIdObj, userToken }
*/
export async function create_user(collection, email="test@example.com", name="user", password="password123", permission=0) {
  const user = await collection.insertOne({
    email: email,
    name: name,
    password: password,
    permission: permission
  });
  const userId = user.insertedId.toString();
  const userToken = create_jwt(userId, name, permission);
  const userIdObj = new ObjectId(userId);
  return {userId, userIdObj, userToken}
}