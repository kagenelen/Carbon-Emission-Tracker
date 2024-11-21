/**
* @file Tests for project management related functions such as edit project data and details
*/

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { ObjectId } from 'mongodb';
import {app, usersCollection, projectsCollection } from '../../test-setup.js';
import projectRouter from '../manage_project.js';
import { create_user, invalidToken, validToken } from './test_helper.js';

beforeEach(async () => {
  app.use('/api', projectRouter);
}, 20000);

afterEach(() => {
  // Ensure all mocks are cleared after each test to prevent interference
  vi.restoreAllMocks();
});


describe('POST /create-project', () => {
  it('should return 401 if token is invalid', async () => {
    const res = await request(app).post('/api/create-project')
      .send({})
      .set('Authorization', 'Bearer ' + invalidToken);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired session token.');
  });

  it('should return 409 if project number is already used by current user', async () => {
    // Create a user
    const { userId, userIdObj, userToken } = await create_user(usersCollection);

    // Create a project with user1
    await projectsCollection.insertOne({
      userId: userIdObj,
      projectName: 'p1',
      projectNumber: '1',
      date: '1/1/1',
      clientName: 'user1',
      revisionNumber: '1',
      transportCo2Rate: 0.22
    });

    // Create another project with with same number as project 1
    let res = await request(app).post('/api/create-project').send({
      userId: userId,
      projectName: 'p2',
      projectNumber: '1',
      date: '2/2/2',
      clientName: 'user1',
      revisionNumber: '1'
    }).set('Authorization', 'Bearer ' + userToken);
    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Project number already exists.');
  });

  it('should return 201 if project is created successfully with correct details', async () => {
    // Create a user
    const { userId, userToken } = await create_user(usersCollection);

    // Create a project with user 1
    let res = await request(app).post('/api/create-project').send({
      userId: userId,
      projectName: "p2",
      projectNumber: "999",
      date: "1/1/2001",
      clientName: 'user1',
      revisionNumber: '1'
    }).set('Authorization', 'Bearer ' + userToken);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Project created successfully');
  });
  
  it('should return 400 if projectNumber, projectName or date is missing', async () => {
    // Test case where 'projectNumber' is missing
    let res = await request(app).post('/api/create-project').send({
      projectName: "name",
      date: '1/1/1',
    }).set('Authorization', 'Bearer ' + validToken);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Project number, project name and date are required fields.');

     // Test case where 'projectName' is missing
     res = await request(app).post('/api/create-project').send({
      projectNumber: "1",
      date: '1/1/1',
    }).set('Authorization', 'Bearer ' + validToken);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Project number, project name and date are required fields.');

     // Test case where 'date' is missing
     res = await request(app).post('/api/create-project').send({
      projectName: "name",
      projectNumber: "1"
    }).set('Authorization', 'Bearer ' + validToken);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Project number, project name and date are required fields.');
  });  
});

describe('GET /get-all-projects/:userId?', () => {
  it('should return 401 if the Authorization header is missing', async () => {
    const response = await request(app).get('/api/get-all-projects');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Access token required');
  });

  it('should return 401 if the token is invalid or expired', async () => {
    const response = await request(app)
      .get('/api/get-all-projects')
      .set('Authorization', 'Bearer ' + invalidToken);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid or expired session token.');
  });

  it('should return 200 and the list of projects for a valid token', async () => {
    const { userIdObj, userToken } = await create_user(usersCollection);
  
    await projectsCollection.insertMany([
      { userId: userIdObj, projectName: 'Project 1', projectNumber: '1', date: '2023-01-01' },
      { userId: userIdObj, projectName: 'Project 2', projectNumber: '2', date: '2023-01-02' }
    ]);
  
    const response = await request(app)
      .get('/api/get-all-projects')
      .set('Authorization', 'Bearer ' + userToken);
  
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Projects retrieved successfully.');
  
    // Extract only the fields you want to check
    const filteredProjects = response.body.projects.map(({ projectName, projectNumber, date }) => ({
      projectName,
      projectNumber,
      date
    }));
  
    expect(filteredProjects).toEqual([
      { projectName: 'Project 1', projectNumber: '1', date: '2023-01-01' },
      { projectName: 'Project 2', projectNumber: '2', date: '2023-01-02' }
    ]);
  });

  it('should return 403 if passing a userId without having admin permission', async () => {
    const { userIdObj, userToken } = await create_user(usersCollection);

    const response = await request(app)
      .get(`/api/get-all-projects/${userIdObj}`)
      .set('Authorization', 'Bearer ' + userToken);
  
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('User does not have admin permissions.');

  }); 

  it('should return 200 and project list if passing a userId as an admin', async () => {
    const { userIdObj, userToken } = await create_user(usersCollection);

    await projectsCollection.insertMany([
      { userId: userIdObj, projectName: 'Project 1', projectNumber: '1', date: '2023-01-01' },
      { userId: userIdObj, projectName: 'Project 2', projectNumber: '2', date: '2023-01-02' }
    ]);

    const { userIdObj: adminIdObj, userToken: adminToken } = await create_user(usersCollection, 'login@example.com', 'loginuser', 'password', 1);

    const response = await request(app)
      .get(`/api/get-all-projects/${userIdObj}`)
      .set('Authorization', 'Bearer ' + adminToken);
  
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Projects retrieved successfully.');
  
    // Extract only the fields you want to check
    const filteredProjects = response.body.projects.map(({ projectName, projectNumber, date }) => ({
      projectName,
      projectNumber,
      date
    }));
  
    expect(filteredProjects).toEqual([
      { projectName: 'Project 1', projectNumber: '1', date: '2023-01-01' },
      { projectName: 'Project 2', projectNumber: '2', date: '2023-01-02' }
    ]);
  }); 


});


describe('POST /edit-project-details', ()=> {
  it('should return 401 if token is invalid', async () => {
    const res = await request(app).post('/api/edit-project-details')
      .send({})
      .set('Authorization', 'Bearer ' + invalidToken);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired session token.');
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

    // Edit a project with existing project number with user2
    let res = await request(app).post('/api/edit-project-details').send({
      projectId: project1.insertedId.toString(),
      projectName: "p2",
      date: "1/1/2001"
    }).set('Authorization', 'Bearer ' + user2.userToken);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Cannot edit a project not owned by you.');
  });

  it('should return 400 if projectId is missing', async () => {
    // Test case where 'projectId' is missing
    const res = await request(app).post('/api/edit-project-details').send({
      projectName: "name",
      date: '1/1/1',
    }).set('Authorization', 'Bearer ' + validToken);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Project id are required fields.');
  });  

  it('should return 200 if project details is successfully updated', async () => {
    // Create a user
    const { userIdObj, userToken } = await create_user(usersCollection);

    // Create a project with user
    await projectsCollection.insertOne({
      userId: userIdObj,
      projectName: 'name',
      projectNumber: '175',
      date: '1/1/1',
      clientName: 'user',
      revisionNumber: '1',
      transportCo2Rate: 0.22
    });

    const project = await projectsCollection.findOne({ projectNumber: '175'})
    const projectId = project._id.toString();

    // Edit project with user
    let res = await request(app).post('/api/edit-project-details').send({
      projectId: projectId,
      projectName: "p100",
    }).set('Authorization', 'Bearer ' + userToken);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Project details updated successfully');

    // Check correct details are updated in the database, and others remain same
    const updatedProject = await projectsCollection.findOne({ _id: project._id})
    expect(updatedProject).not.toBeFalsy();
    expect(updatedProject.projectName).toBe('p100');
    expect(updatedProject.projectNumber).toBe('175');
    expect(updatedProject.date).toBe('1/1/1');
    expect(updatedProject.clientName).toBe('user');
    expect(updatedProject.revisionNumber).toBe('1');
    expect(updatedProject.transportCo2Rate).toBe(0.22);

  });
});

describe('POST /edit-project-data', () => {
  it('should return 401 if token is invalid', async () => {
    const res = await request(app).post('/api/edit-project-data')
      .send({})
      .set('Authorization', 'Bearer ' + invalidToken);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired session token.');
  });

  it('should return 200 if project data is updated successfully', async () => {
    // Create user
    const { userIdObj, userToken } = await create_user(usersCollection);

    // Create a project with user
    const project = await projectsCollection.insertOne({
      userId: userIdObj,
      projectName: 'p1',
      date: '1/1/1',
      clientName: 'user1',
      revisionNumber: '1',
      transportCo2Rate: 0.22
    });

    // Edit a project with existing project number with user2
    let projectData = [
      {material: 'Concrete', tonnage: 12, recycledPercentage: 100, truck: 1, plantCo2Rate: 500, finalProductCo2Rate: 200},
      {material: 'Brick',  tonnage: 34, recycledPercentage: 0, truck: 2, landfillDist: 500, plantDist: 200}
    ]
    let res = await request(app).post('/api/edit-project-data').send({
      projectId: project.insertedId.toString(),
      projectData: projectData
    }).set('Authorization', 'Bearer ' + userToken);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Project data updated successfully');

    // Check correct details are updated in the database
    const updatedProject = await projectsCollection.findOne({ _id: project.insertedId})
    expect(updatedProject).not.toBeFalsy();
    expect(updatedProject.materials['Concrete'].tonnage).toBe(12);
    expect(updatedProject.materials['Concrete'].recycled).toBe(100);
    expect(updatedProject.materials['Concrete'].truck).toBe(1);
    expect(updatedProject.materials['Concrete'].plantCo2Rate).toBe(500);
    expect(updatedProject.materials['Concrete'].finalProductCo2Rate).toBe(200);
    expect(updatedProject.materials['Concrete'].landfillDist).toBe(40); // default value
    expect(updatedProject.materials['Concrete'].plantDist).toBe(30); //default value

    expect(updatedProject.materials['Brick'].tonnage).toBe(34);
    expect(updatedProject.materials['Brick'].recycled).toBe(0);
    expect(updatedProject.materials['Brick'].truck).toBe(2);
    expect(updatedProject.materials['Brick'].plantCo2Rate).toBe(500); // default value
    expect(updatedProject.materials['Brick'].finalProductCo2Rate).toBe(750); // default value
    expect(updatedProject.materials['Brick'].landfillDist).toBe(500);
    expect(updatedProject.materials['Brick'].plantDist).toBe(200);
  });

  it('should only edit given fields, and other fields should remain the same', async () => {
    // Create user
    const { userIdObj, userToken } = await create_user(usersCollection);

    // Create a project with user
    const project = await projectsCollection.insertOne({
      userId: userIdObj,
      projectName: 'p1',
      date: '1/1/1',
      clientName: 'user1',
      revisionNumber: '1',
      transportCo2Rate: 0.22
    });

    // Fill a project with data
    let projectData = [
      {material: 'Concrete', tonnage: 1, recycledPercentage: 2, truck: 3, plantCo2Rate: 4, finalProductCo2Rate: 5},
      {material: 'Brick',  tonnage: 6, recycledPercentage: 7, truck: 8, landfillDist: 9, plantDist: 10}
    ]
    await request(app).post('/api/edit-project-data').send({
      projectId: project.insertedId.toString(),
      projectData: projectData
    }).set('Authorization', 'Bearer ' + userToken);

    // Edit project data with a subset of fields
    projectData = [
      {material: 'Concrete', plantCo2Rate: 11, finalProductCo2Rate: 12}
    ]
    await request(app).post('/api/edit-project-data').send({
      projectId: project.insertedId.toString(),
      projectData: projectData
    }).set('Authorization', 'Bearer ' + userToken);

    const updatedProject = await projectsCollection.findOne({ _id: project.insertedId})

    // Check given data is updated
    expect(updatedProject.materials['Concrete'].plantCo2Rate).toBe(11);
    expect(updatedProject.materials['Concrete'].finalProductCo2Rate).toBe(12);

    // Check ungiven data is untouched
    expect(updatedProject.materials['Concrete'].tonnage).toBe(1);
    expect(updatedProject.materials['Concrete'].recycled).toBe(2);
    expect(updatedProject.materials['Concrete'].truck).toBe(3);
    expect(updatedProject.materials['Concrete'].landfillDist).toBe(40); // default value
    expect(updatedProject.materials['Concrete'].plantDist).toBe(30); //default value

    expect(updatedProject.materials['Brick'].tonnage).toBe(6);
    expect(updatedProject.materials['Brick'].recycled).toBe(7);
    expect(updatedProject.materials['Brick'].truck).toBe(8);
    expect(updatedProject.materials['Brick'].plantCo2Rate).toBe(500); // default value
    expect(updatedProject.materials['Brick'].finalProductCo2Rate).toBe(750); // default value
    expect(updatedProject.materials['Brick'].landfillDist).toBe(9);
    expect(updatedProject.materials['Brick'].plantDist).toBe(10);
  });

  it('should return 401 if project is not owned by user', async () => {
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

    // Edit a project with existing project number with user2
    let res = await request(app).post('/api/edit-project-data').send({
      projectId: project1.insertedId.toString(),
      projectData: {}
    }).set('Authorization', 'Bearer ' + user2.userToken);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Cannot edit a project not owned by you.');
  });

  it('should return 400 if projectId or projectData is missing', async () => {
    // Test case where 'projectId' is missing
    let res = await request(app).post('/api/edit-project-data').send({
      projectData: [{"material": "apple"}]
    }).set('Authorization', 'Bearer ' + validToken);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Project id and project data are required fields.');
  
    // Test case where 'projectData' is missing
    res = await request(app).post('/api/edit-project-data').send({
      projectId: "123456789012345678901234"
    }).set('Authorization', 'Bearer ' + validToken);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Project id and project data are required fields.');
  });  

  describe('DELETE /delete-project/:projectId', () => {
    it('should return 401 if token is invalid', async () => {
      const res = await request(app).delete('/api/delete-project/123456789012345678901234')
        .send({})
        .set('Authorization', 'Bearer ' + invalidToken);
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid or expired session token.');
    });
  
    it('should return 200 if project is deleted successfully', async () => {
      // Create user
      const { userIdObj, userToken } = await create_user(usersCollection);
  
      // Create a project with user
      const project = await projectsCollection.insertOne({
        userId: userIdObj,
        projectName: 'p1',
        date: '1/1/1',
        clientName: 'user1',
        revisionNumber: '1',
        transportCo2Rate: 0.22
      });
  
      // Delete the project
      let res = await request(app).delete(`/api/delete-project/${project.insertedId.toString()}`).send({

      }).set('Authorization', 'Bearer ' + userToken);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Project successfully deleted.');
  
      // Check project doesn't exist in the database
      const updatedProject = await projectsCollection.findOne({ _id: project.insertedId})
      expect(updatedProject).toBeFalsy();
    });
  
    it('should return 401 if project is not owned by user', async () => {
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
  
      // Delete the project with user2
      let res = await request(app).delete(`/api/delete-project/${project1.insertedId.toString()}`).send({

      }).set('Authorization', 'Bearer ' + user2.userToken);
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Cannot delete a project not owned by you.');
    });
  
    it('should return 404 if project doesn\'t exist', async () => {
      // Create user
      const { userToken } = await create_user(usersCollection);
  
      // Delete non-existent project
      let res = await request(app).delete(`/api/delete-project/123456789012345678901234`).send({

      }).set('Authorization', 'Bearer ' + userToken);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Project not found.');
    });  
  });
});
