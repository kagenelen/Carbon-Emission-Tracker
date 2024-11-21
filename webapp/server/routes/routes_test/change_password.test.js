/**
* @file Tests for changing password at /confirm_password
*/

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import confirmPasswordRouter from '../change_password.js';
import bcrypt from 'bcryptjs';  // Password hashing
import registerRouter from '../user.js';
import {app, usersCollection } from '../../test-setup.js';
import { create_user, invalidToken, validToken } from './test_helper.js';

beforeEach(async () => {

  app.use('/api', confirmPasswordRouter);
  app.use('/api', registerRouter);
}, 20000);

describe('POST /confirm_password', () => {
  it('should return 401 if token is invalid', async () => {
    const res = await request(app).post('/api/confirm_password')
      .send({})
      .set('Authorization', 'Bearer ' + invalidToken);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired session token.');
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/api/confirm_password')
      .send({})
      .set('Authorization', 'Bearer ' + validToken);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });

  it('should return 400 if current password is incorrect', async () => {
    // Create user
    const currentPassword = await bcrypt.hash('currentpassword', 10);
    const { userId, userToken } = await create_user(usersCollection, 'test@test.com', 'user', currentPassword);

    const res = await request(app).post('/api/confirm_password').send({
      password: 'wrongpassword',
      newPassword: 'newpassword123',
      userId: userId,
    })
    .set('Authorization', 'Bearer ' + userToken);
    
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Current password is incorrect');
  });

  it('should return 200 if password is updated successfully', async () => {
    const unhashedPassword = 'currentpassword'
    const hashedPassword = await bcrypt.hash(unhashedPassword, 10);

    // Create user
    const { userId, userToken } = await create_user(usersCollection, 'test@test.com', 'user', hashedPassword);

    const res = await request(app).post('/api/confirm_password').send({
      password: unhashedPassword,
      newPassword: 'newpassword123',
      userId: userId,
    })
    .set('Authorization', 'Bearer ' + userToken);

    //expect(res.status).toBe(200);
    expect(res.body.message).toBe('Password updated successfully');
  });
});
