/**
* @file Tests for user related functions such as login, logout, session, register
*/

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';  // Password hashing
import registerRouter from '../user.js';
import {app, usersCollection } from '../../test-setup.js';
import {decode_jwt} from '../../utils/jwt_session.js';
import { create_user, invalidToken, validToken } from './test_helper.js';

beforeEach(async () => {
  app.use('/api', registerRouter);
  vi.useFakeTimers();
}, 20000);  // Extend hook timeout to 20 seconds

describe('POST /register', () => {
  it('should return 400 if user already exists', async () => {

    // Create user with default email test@example.com
    await create_user(usersCollection);

    // Create another user with a duplicate email
    const res = await request(app).post('/api/register').send({
      name: 'Test User2',
      email: 'test@example.com',
      password: 'password123',
    });

    // Expect the response status to be 400 and appropriate error message
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User with this email already exists');
  });

  it('should return 201 if a new user is successfully registered with a random email', async () => {
    // Generate a random email
    const randomEmail = `user_${Math.random().toString(36).substring(7)}@example.com`;
  
    // Send registration request with valid data
    const res = await request(app).post('/api/register').send({
      name: 'New User',
      email: randomEmail,  // Use the random email
      password: 'password123',
    });
  
    // Check response status and body
    expect(res.status).toBe(201);  // Expect status 201 (created)
    expect(res.body.message).toBe('User registered successfully');
    
    // Compare the actual userId returned by MongoDB, ensuring both are converted to strings
    expect(typeof res.body.userId).toBe('string');
    expect(res.body.userId.length).toBe(24); // Ensure it's a valid ObjectId length
  });
  
  it('should return 400 if name, email, or password is missing', async () => {
    // Test case where 'name' is missing
    let res = await request(app).post('/api/register').send({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  
    // Test case where 'email' is missing
    res = await request(app).post('/api/register').send({
      name: 'Test User',
      password: 'password123',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  
    // Test case where 'password' is missing
    res = await request(app).post('/api/register').send({
      name: 'Test User',
      email: 'test@example.com',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });  
});

describe('POST /login', () => {
  it('should return 200 and correct session token if login is successful', async () => {
    // Create user
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const { userId } = await create_user(usersCollection, 'login@example.com', 'loginuser', hashedPassword);
    
    // Login as user
    const res = await request(app).post('/api/login').send({
      name: 'loginuser',
      password: password,
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');

    // Check session token after login is correct
    const payload = decode_jwt(res.body.jwtToken);
    expect(payload).toBeTruthy();
    expect(payload.userName).toBe('loginuser');
    expect(payload.userId).toBe(userId);
    expect(payload.permission).toBe(0);
    
  });

  it('if session token is expired, it should be invalid', async () => {
    // Create user
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    await create_user(usersCollection, 'expired@example.com', 'expireduser', hashedPassword);
    
    // Login as user
    const res = await request(app).post('/api/login').send({
      name: 'expireduser',
      password: password,
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');

    vi.advanceTimersByTime(86400000); // Move time forward by 1 day

    // Check payload after login with expired token is empty
    const payload = decode_jwt(res.body.jwtToken);
    expect(payload).toMatchObject({});
    
  });
  
  it('should return 400 if name or password is missing', async () => {
    // Test case where 'password' is missing
    let res = await request(app).post('/api/login').send({
      name: 'test@example.com'
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  
    // Test case where 'name' is missing
    res = await request(app).post('/api/register').send({
      password: 'password123'
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('All fields are required');
  });  
});


describe('Get /get-all-users', () => {
  it('should return 200 and list of users if user is admin', async () => {
    const users = [
      {name: 'admin', email: 'email@admin.com', password: 'admin', permission: 1},
      {name: 'user1', email: 'email@1.com', password: 'password1', permission: 0},
      {name: 'user2', email: 'email@2.com', password: 'password2', permission: 0},
      {name: 'user3', email: 'email@3.com', password: 'password3', permission: 0},
    ];
    const { userIdObj: adminIdObj, userToken: adminToken } = await create_user(
      usersCollection, users[0].email, users[0].name, users[0].password, 1
    );
    await usersCollection.insertMany(users.slice(1));
  
    const res = await request(app)
      .get('/api/get-all-users')
      .set('Authorization', 'Bearer ' + adminToken);
  
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Users retrieved successfully.');
  
    const filteredUsers = users.map(({ name, email, password }) => ({
      name,
      email,
      password
    }));
    const filteredUserResponse = res.body.users.map(({ name, email, password }) => ({
      name, email, password }))
    .filter(({ name }) => (['admin', 'user1', 'user2', 'user3']).includes(name));
    expect(filteredUserResponse).toEqual(filteredUsers);
  });

  it('should return 401 if token is invalid', async () => {
    const res = await request(app)
      .get('/api/get-all-users')
      .set('Authorization', 'Bearer ' + invalidToken);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired session token.');
  });

  it('should return 403 if user is not admin', async () => {
    const { userIdObj, userToken } = await create_user(usersCollection);
    const res = await request(app)
      .get('/api/get-all-users')
      .set('Authorization', 'Bearer ' + userToken);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('User does not have admin permissions.');
  });
});

describe('GET /get-user/:userId', () => {
  it('should return 200 and user object if user is admin', async () => {
    const user = {name: 'user1', email: 'email@1.com', password: 'password1', permission: 0};
    const { userIdObj, userToken } = await create_user(usersCollection, user.email, user.name, user.password, user.permission);
    const { userIdObj: adminIdObj, userToken: adminToken } = await create_user(usersCollection, 'login@example.com', 'loginuser', 'password', 1);

    const res = await request(app)
      .get(`/api/get-user/${userIdObj}`)
      .set('Authorization', 'Bearer ' + adminToken);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User retrieved successfully.');
    console.log(user)
    console.log(res.body.users);
    const userRes = res.body.users; 
    expect({name: userRes.name, email: userRes.email, password: userRes.password, permission: userRes.permission}).toEqual(user);

  });

  it('should return 401 if token is invalid', async () => {
    const { userIdObj, userToken } = await create_user(usersCollection);
    console.log(`/api/${userIdObj}`)
    const res = await request(app)
      .get(`/api/get-user/${userIdObj}`)
      .set('Authorization', 'Bearer ' + invalidToken);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired session token.');
  });

  it('should return 403 if user is not admin', async () => {
    const { userIdObj, userToken } = await create_user(usersCollection);
    const res = await request(app)
      .get(`/api/get-user/${userIdObj}`)
      .set('Authorization', 'Bearer ' + userToken);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('User does not have admin permissions.');
  });
});

afterEach(async () => {
  vi.useRealTimers();
});