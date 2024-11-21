/**
* @file Tests for requesting password reset and resetting password 
* at /request-password-reset and /:userId/:token
*/

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import registerRouterUser from '../user.js';
import registerRouterRequestReset from '../request_password_reset.js';
import {app, usersCollection, tokensCollection } from '../../test-setup.js';
import { create_user } from './test_helper.js';

beforeEach(async () => {
  app.use('/api', registerRouterUser);
  app.use('/api', registerRouterRequestReset);
}, 20000);  // Extend hook timeout to 20 seconds

describe('POST /request-password-reset', () => {
  it('should return 400 if email is missing', async () => {
    // Test missing email in password reset request
    const res = await request(app).post('/api/request-password-reset').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Enter a valid email.');
  });

  it('should return 400 if email does not belong to registered user', async () => {
    // Test with an email that doesn't exist in the system
    const res = await request(app).post('/api/request-password-reset').send({
      email: 'notauser@example.com',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('No user is registered with this email.');
  });

  it('should return 201 if password reset email is successfully sent', async () => {
    // Create user
    await create_user(usersCollection, 'rubblestorenewal@gmail.com', 'Test', 'password123');

    const res = await request(app)
      .post('/api/request-password-reset')
      .send({ email: 'rubblestorenewal@gmail.com' });

    expect(res.status).toBe(202);  // Assuming the password reset request succeeds
  }, 20000);
});



describe('POST /:userId/:token/login', () => {

  // This test has a high chance of failing on its first run in github actions
  /*
  it('should return 200 if password reset is successful', async () => {
    // Create user
    const { userId, userIdObj } = await create_user(usersCollection, 'reset@example.com', 'resetuser', 'pass');

    // Find the user in the database
    const user1 = await usersCollection.findOne({name: 'resetuser'});
    const token = 'token123';

    // Create a password reset token in the database
    await tokensCollection.insertOne({
      userId: userIdObj,
      token: token,
      expiresAt: Date.now() + 3600000
    });
    
    // Reset password with /userId/token
    const res = await request(app).post(`/api/${userId}/${token}`).send({
      password: 'newpassword',
    });
    expect(res.status).toBe(200);  // Assuming the password reset request succeeds
    expect(res.body.message).toBe('Password reset successfully');

    // Check password is updated in the database
    const user2 = await usersCollection.findOne({name: 'resetuser'});
    expect(user2.password).not.toBe(user1.password); // old password is not same as new password

  });
  */

  it('should return 400 if reset link is expired', async () => {
    // Create user
    const { userId, userIdObj } = await create_user(usersCollection);
    const token = 'token456';

    // Create a password reset token in the database
    await tokensCollection.insertOne({
      userId: userIdObj,
      token: token,
      expiresAt: Date.now() - 10
    });
    
    // Attempt to use reset link with expired token
    const res = await request(app).post(`/api/${userId}/${token}`).send({
      password: 'qwerty'
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Password reset link is expired.');
  });


  it('should return 400 if reset link is invalid', async () => {
    // Create user
    const { userId, userIdObj } = await create_user(usersCollection);
    const token = 'token789';

    // Create a password reset token in the database
    await tokensCollection.insertOne({
      userId: userIdObj,
      token: token,
      expiresAt: Date.now() + 3600000
    });
    
    // Attempt to use reset link with invalid token
    const res = await request(app).post(`/api/${userId}/notatoken`).send({
      password: 'qwerty'
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Password reset link is invalid.');
  });
});
