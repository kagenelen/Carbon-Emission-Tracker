/**
* @file Tests for machine learning and waste forecasting
*/

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { ObjectId } from 'mongodb';
import {app, usersCollection, projectsCollection } from '../../test-setup.js';
import projectRouter from '../predict_waste.js';
import { create_user, invalidToken, validToken } from './test_helper.js';


beforeEach(async () => {
  app.use('/api', projectRouter);
}, 20000);

afterEach(() => {
  // Ensure all mocks are cleared after each test to prevent interference
  vi.restoreAllMocks();
});


describe('POST /predict_waste', () => {
  it('should return 401 if token is invalid', async () => {
    const res = await request(app).post('/api/predict-waste')
      .send({})
      .set('Authorization', 'Bearer ' + invalidToken);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired session token.');
  });
  
  it('should return 400 if projectId, usage, gfa or floor is missing', async () => {
    // Test case where 'projectId' is missing
    let res = await request(app).post('/api/predict-waste').send({
      usage: 'education',
      gfa: 123.4,
      floor: 2,
    }).set('Authorization', 'Bearer ' + validToken);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Project Id, usage, gfa and floor are required fields.');

    // Test case where 'usage' is missing
    res = await request(app).post('/api/predict-waste').send({
      projectId: '123456789012345678901234',
      gfa: 123.4,
      floor: 2,
    }).set('Authorization', 'Bearer ' + validToken);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Project Id, usage, gfa and floor are required fields.');

    // Test case where 'gfa' is missing
    res = await request(app).post('/api/predict-waste').send({
      projectId: '123456789012345678901234',
      usage: 'education',
      floor: 2,
    }).set('Authorization', 'Bearer ' + validToken);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Project Id, usage, gfa and floor are required fields.');

    // Test case where 'floor' is missing
    res = await request(app).post('/api/predict-waste').send({
      projectId: '123456789012345678901234',
      usage: 'education',
      gfa: 123.4
    }).set('Authorization', 'Bearer ' + validToken);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Project Id, usage, gfa and floor are required fields.');

  });  

  it('should return 400 if project does not exist', async () => {
    let res = await request(app).post('/api/predict-waste').send({
      projectId: '123456789012345678901234',
      usage: 'education',
      gfa: 123.4,
      floor: 2
    }).set('Authorization', 'Bearer ' + validToken);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Project does not exist.');
  });

  it('should return 401 if project is not owned by current user', async () => {
    // Create two users
    const user1 = await create_user(usersCollection, 'user1@example.com', 'user1', 'pass');
    const user2 = await create_user(usersCollection, 'user2@example.com', 'user2', 'pass');

    // Create a project with user1
    const project1 = await projectsCollection.insertOne({
      userId: user1.userIdObj,
      projectName: 'p1',
      date: '1/1/1',
      clientName: 'user1',
      revisionNumber: '1',
      transportCo2Rate: 0.22
    });

    // Do forecast on existing project with user2
    let res = await request(app).post('/api/predict-waste').send({
      projectId: project1.insertedId.toString(),
      usage: 'education',
      gfa: 123.4,
      floor: 2
    }).set('Authorization', 'Bearer ' + user2.userToken);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Cannot edit a project not owned by you.');
  });

  // This test doesn't work on github workflow because there is no python installed on there
  /*
  it('should return 200 and have proportional tonnage if historical forecast is successful', async () => {
    // Create user
    const { userIdObj, userToken } = await create_user(usersCollection);
    
    // Insert 2 projects for historical data + 1 project that is process of being created
    // Concrete is 25%, VENM is 75%
    await projectsCollection.insertMany([
      { userId: userIdObj, 
        projectName: 'Project 1', 
        projectNumber: '1', 
        date: '2023-01-01', 
        materials: {
          Concrete: {tonnage: 100},
          VENM: {tonnage: 400}
      }},
      { userId: userIdObj, 
        projectName: 'Project 2', 
        projectNumber: '2', 
        date: '2023-01-01', 
        materials: {
          Concrete: {tonnage: 150},
          VENM: {tonnage: 350}
      }},
      { userId: userIdObj, 
        projectName: 'Project 3', 
        projectNumber: '3', 
        date: '2023-01-01', 
        materials: {}
      },
    ]);

    const project3 = await projectsCollection.findOne({ projectName: 'Project 3'});

    // Do forecast on project 3
    const res = await request(app).post('/api/predict-waste').send({
      projectId: project3._id.toString(),
      usage: 'education',
      gfa: 123.4,
      volume: 1234,
      floor: 2,
      useMyData: true
    }).set('Authorization', 'Bearer ' + userToken);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Project data predicted and updated successfully');
    
    // Check that project data is populated
    const updatedProject = await projectsCollection.findOne({ projectName: 'Project 3'});
    expect(updatedProject.materials).not.toBeFalsy();

    // Venm should be 3 times more than concrete due to historical average
    expect(updatedProject.materials.VENM.tonnage / 3).toBeCloseTo(updatedProject.materials.Concrete.tonnage, 1);

    // For this particular model the total waste should add up to 75.49329
    let totalWaste = (parseFloat(updatedProject.materials.VENM.tonnage) + parseFloat(updatedProject.materials.Concrete.tonnage));
    expect(totalWaste).toBeCloseTo(75.49329, 1);

  }, 25000);
  */

});
