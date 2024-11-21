/**
* @file Tests for changing email at /confirm_email
*/

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import confirmEmailRouter from '../change_email.js';
import {app, usersCollection } from '../../test-setup.js';
import { create_user, validToken, invalidToken } from './test_helper.js';

beforeEach(async () => {
  // Use actual db.collection() for the routes
  app.use('/api', confirmEmailRouter);

}, 20000);

describe('POST /confirm_email', () => {
  it('should return 401 if token is invalid', async () => {
    const res = await request(app).post('/api/confirm_email')
      .send({})
      .set('Authorization', 'Bearer ' + invalidToken);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired session token.');
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/api/confirm_email')
      .send({})
      .set('Authorization', 'Bearer ' + validToken);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });

  it('should return 400 if the new email is already in use', async () => {
    // Insert first user
    const { userToken } = await create_user(usersCollection, 'current@example.com', 'John', 'password123');

    // Insert a second user with the new email
    const user2Email = 'newemail@example.com'
    await create_user(usersCollection, user2Email, 'Jane', 'password123');

    // Change user1 email to user2's email
    const res = await request(app).post('/api/confirm_email')
      .send({
        newEmail: user2Email,
      })
      .set('Authorization', 'Bearer ' + userToken);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('This email is already in use');
  });

  it('should return 200 if email is updated successfully with a random new email', async () => {
    // Insert user
    const { userToken } = await create_user(usersCollection);

    // Generate a random new email
    const randomNewEmail = `user_${Math.random().toString(36).substring(7)}@example.com`;
    
    const res = await request(app).post('/api/confirm_email')
      .send({
        newEmail: randomNewEmail,
      })
      .set('Authorization', 'Bearer ' + userToken);

    // Check response status and body
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Email updated successfully');

    // Check if the email is updated in the database
    const updatedUser = await usersCollection.findOne({ email: randomNewEmail });
    expect(updatedUser).not.toBeNull();
    expect(updatedUser.email).toBe(randomNewEmail);
  });
});
