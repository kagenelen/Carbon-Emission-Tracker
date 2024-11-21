/**
* @file Tests for creating graphs at /graphs
*/

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import {app, usersCollection, projectsCollection } from '../../test-setup.js';
import graphRouter from '../graphs.js'
import {create_user} from './test_helper.js';

beforeEach(async () => {
  app.use('/api', graphRouter);
}, 20000);

describe('POST /reductionChart', () => {

  it('should return 400 if no project ID is given', async () => {
    const res = await request(app).post('/api/reductionChart')
      .send({})
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Project ID required');
  });

  
  it('should return 400 if project ID is invalid', async () => {
    const res = await request(app).post('/api/reductionChart')
      .send({projectID:'definately a valid ID'})
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('The requested project could not be found');
  });

  it('should return 201 if data was calculated successfully', async () => {

    // Create a user
    const {userIdObj} = await create_user(usersCollection);

    // Create a project with user1
    await projectsCollection.insertOne({
      userId: userIdObj,
      projectName: 'graphtesting',
      projectNumber: '201',
      date: '01/01/1970',
      clientName: 'graphtest',
      revisionNumber: '1',
      transportCo2Rate: 0.22
    });

    const project = await projectsCollection.findOne({ projectNumber: '201'});
    const projectID = project._id;

    const res = await request(app).post('/api/reductionChart')
      .send({projectID:projectID})
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Data calculated successfully');
  });

});

describe('POST /ratioChart', () => {

  it('should return 400 if no project ID is given', async () => {
    const res = await request(app).post('/api/ratioChart')
      .send({})
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Project ID required');
  });

  
  it('should return 400 if project ID is invalid', async () => {
    const res = await request(app).post('/api/ratioChart')
      .send({projectID:'definately a valid ID'})
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('The requested project could not be found');
  });

  it('should return 201 if data was calculated successfully', async () => {

    // Create a user
    const {userIdObj} = await create_user(usersCollection);

    // Create a project with user1
    await projectsCollection.insertOne({
      userId: userIdObj,
      projectName: 'graphtesting',
      projectNumber: '201',
      date: '01/01/1970',
      clientName: 'graphtest',
      revisionNumber: '1',
      transportCo2Rate: 0.22
    });

    const project = await projectsCollection.findOne({ projectNumber: '201'});
    const projectID = project._id;

    const res = await request(app).post('/api/ratioChart')
      .send({projectID:projectID})
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Data calculated successfully');
  });

});

describe('POST /reductionPie', () => {

  it('should return 400 if no project ID is given', async () => {
    const res = await request(app).post('/api/reductionPie')
      .send({})
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Project ID required');
  });

  
  it('should return 400 if project ID is invalid', async () => {
    const res = await request(app).post('/api/reductionPie')
      .send({projectID:'definately a valid ID'})
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('The requested project could not be found');
  });

  it('should return 201 if data was calculated successfully', async () => {

    // Create a user
    const {userIdObj} = await create_user(usersCollection);

    // Create a project with user1
    await projectsCollection.insertOne({
      userId: userIdObj,
      projectName: 'graphtesting',
      projectNumber: '201',
      date: '01/01/1970',
      clientName: 'graphtest',
      revisionNumber: '1',
      transportCo2Rate: 0.22
    });

    const project = await projectsCollection.findOne({ projectNumber: '201'});
    const projectID = project._id;

    const res = await request(app).post('/api/reductionPie')
      .send({projectID:projectID})
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Data calculated successfully');
  });

});

describe('POST /emissionPie', () => {

  it('should return 400 if no project ID is given', async () => {
    const res = await request(app).post('/api/emissionPie')
      .send({})
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Project ID required');
  });

  
  it('should return 400 if project ID is invalid', async () => {
    const res = await request(app).post('/api/emissionPie')
      .send({projectID:'definately a valid ID'})
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('The requested project could not be found');
  });
  /*
  it('should return 201 if data was calculated successfully', async () => {

    // Create a user
    const {userIdObj} = await create_user(usersCollection);

    // Create a project with user1
    await projectsCollection.insertOne({
      userId: userIdObj,
      projectName: 'graphtesting',
      projectNumber: '201',
      date: '01/01/1970',
      clientName: 'graphtest',
      revisionNumber: '1',
      transportCo2Rate: 0.22,
      materials: [
        {material: 'Concrete', tonnage: 12, recycledPercentage: 100, truck: 1, plantCo2Rate: 500, finalProductCo2Rate: 200},
        {material: 'Brick',  tonnage: 34, recycledPercentage: 0, truck: 2, landfillDist: 500, plantDist: 200}
        ]
    });

    const project = await projectsCollection.findOne({ projectNumber: '201'});
    const projectID = project._id;

    const res = await request(app).post('/api/emissionPie')
      .send({projectID:projectID})

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Data calculated successfully');
  });*/

});
