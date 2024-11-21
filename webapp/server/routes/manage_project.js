/**
* @file Routes to manage project
* @route post/create-project
* @route post/edit-project-details
* @route post/edit-project-data
* @route get/get-all-projects/:userId?
* @route get/get-project-details/:projectId
* @route get/get-project-data/:projectId
* @route delete/delete-project/:projectId
*/

import express from 'express';
import { db } from "../db/connection.js";  // MongoDB connection methods
import mongodb from 'mongodb';
import { auth_middleware } from '../utils/jwt_session.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).send('Project route working!');
  });

/** 
* Route to create project, serving /new-project-details route
* @name post/create-project
* @param {string} userId - User's id
* @param {string} projectName - Project name
* @param {string} projectNumber - User's chosen project number, not the project Id
* @param {string} date - User's chosen date
* @param {string} clientName - Client name, not the user's name
* @param {string} revisionNumber - Revision number
* @returns {object} res.body.{message, projectId}
*/
router.post("/create-project", auth_middleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { projectName, projectNumber, date, clientName, revisionNumber } = req.body;

        // Validate the input data
        if (!projectNumber || !date || !projectName) {
            return res.status(400).json({ message: "Project number, project name and date are required fields." });
        }
        
        const userIdObj =  new mongodb.ObjectId(userId)

        // Check if  project number is already used by current user
        const projectCollection = db.collection("projects");
        const existingProject = await projectCollection.findOne({ userId: userIdObj, projectNumber });
        if (existingProject) {
            return res.status(409).json({ message: "Project number already exists." });
        } 

        // Create new project
        const newProject = {
            userId: userIdObj,
            projectName,
            projectNumber,
            date,
            clientName: clientName || "-",  // "-" if not provided
            revisionNumber: revisionNumber || "-",  // "-" if not provided
            transportCo2Rate: 0.22,
            materials: {}
        };

        // Insert the new project into the db
        const result = await projectCollection.insertOne(newProject);

        // Return success response
        res.status(201).json({ message: "Project created successfully", projectId: result.insertedId.toString() });
        
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create project." });
    }
});

/** 
* Route to edit project details, serving ? route
* @name post/edit-project-details
* @param {string} userId - User's id
* @param {string} projectName - Project name
* @param {string} date - User's chosen date
* @param {string} clientName - Client name, not the user's name
* @param {string} revisionNumber - Revision number
* @returns {object} res.body.{message}
*/
router.post("/edit-project-details", auth_middleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { projectId, projectName, date, clientName, revisionNumber, transportCo2Rate } = req.body;

        // Validate the input data
        if (!projectId) {
            return res.status(400).json({ message: "Project id are required fields." });
        }

        // Check if project exists 
        const projectIdObj =  new mongodb.ObjectId(projectId)
        const projectCollection = db.collection("projects");
        const existingProject = await projectCollection.findOne({ _id: projectIdObj });
        if (!existingProject) {
            return res.status(400).json({ message: "Project does not exist" });
        }
        
        // Check if project is owned by user
        if (existingProject.userId.toString() != userId) {
            return res.status(401).json({ message: "Cannot edit a project not owned by you." });
        }

        // Update project details
        await projectCollection.updateOne({ _id: projectIdObj }, 
            { $set: {
                projectName: projectName || existingProject.projectName,
                date: date || existingProject.date,
                clientName: clientName || existingProject.clientName,
                revisionNumber: revisionNumber || existingProject.revisionNumber,
                transportCo2Rate: transportCo2Rate || existingProject.transportCo2Rate
            }}
        );

        // Return success response
        res.status(200).json({ message: "Project details updated successfully" });
        
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update project details." });
    }
});

/** 
* Route to create project and input project details, serving /new-project-details route
* @name post/edit-project-data
* @param {string} projectId - Project's id
* @param {[object]} projectData - [{material, tonnage, recycledPercentage, truck, plantCo2Rate, finalProductCo2Rate, landfillDist, plantDist}]
* @returns {object} res.body.{message}
*/
router.post("/edit-project-data", auth_middleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { projectId, projectData } = req.body;
        const projectIdObj = new mongodb.ObjectId(projectId);

        // Validate the input data
        if (!projectId || !projectData) {
        return res.status(400).json({ message: "Project id and project data are required fields." });
        }

        // Check if project exists
        const collection = db.collection("projects");
        const project = await collection.findOne({ _id: projectIdObj });
        if (!project) {
            return res.status(400).json({ message: "Project does not exist." });
        }

        // Check if project is owned by user
        if (project.userId.toString() != userId) {
            return res.status(401).json({ message: "Cannot edit a project not owned by you." });
        }

        // Update project data
        // If projectData is undefined for a field, use existing data
        // If existing data is undefined for a field, use default
        const materialsObject = projectData.reduce((obj, item) => {
            const projMat = project.materials?.[item.material];

            obj[item.material] = {
                tonnage: item.tonnage ?? projMat?.tonnage ?? 0,
                recycled: item.recycledPercentage ?? projMat?.recycled ?? 0,
                truck: item.truck ?? projMat?.truck ?? 10,
                plantCo2Rate: item.plantCo2Rate ?? projMat?.plantCo2Rate ?? 500,
                finalProductCo2Rate: item.finalProductCo2Rate ?? projMat?.finalProductCo2Rate ?? 750,
                landfillDist: item.landfillDist ?? projMat?.landfillDist ?? 40,
                plantDist: item.plantDist ?? projMat?.plantDist ?? 30,
            };
            return obj;
        }, {});

        const allMaterialsObject = {
            ...project.materials, // Place existing values first
            ...materialsObject // Replace some existing with updated values
        }

        await collection.updateOne({ _id: projectIdObj }, 
            { $set: {
                materials: allMaterialsObject
            }});
        

        // Return success response
        res.status(200).json({ message: "Project data updated successfully" });
        
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update project data." });
    }
});



/** 
 * Route to retrieve all projects associated with an authenticated user
 * Also used to retrieve projects of a user with `userId` by an admin account
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} res.body - JSON response containing a message and, if successful, the list of projects associated with the user
 * @throws {403} If retrieving projects of a user by userId without having admin permissions
 * @throws {500} If an error occurs while retrieving projects
 */
router.get("/get-all-projects/:userId?", auth_middleware, async (req, res) => {
    try {
      // Check whether user is attempting to retrieve projects as an admin but without correct permissions
      if (req.params.userId && !req.user.permission) {
        res.status(403).json({ message: "User does not have admin permissions." });
        return;
      }
      // Set userId to either userId from parameters or from authenticated user
      const userId = req.params.userId || req.user.userId;
      const collection = db.collection("projects");
  
      const projects = await collection.find({ userId: new mongodb.ObjectId(userId) }).toArray();
  
      res.status(200).json({ message: "Projects retrieved successfully.", projects });
    } catch (err) {
      console.error('Error retrieving projects:', err);
      res.status(500).json({ message: "Failed to retrieve projects." });
    }
  });
  
/** 
* Route to retrieve project details
* @name get/get-project-details/:projectId
* @param {string} projectId - Project id
* @returns {object} res.body.{message, {projectName, projectNumber, date, clientName, revisionNumber, transportCo2Rate}}
*/
router.get("/get-project-details/:projectId", auth_middleware, async (req, res) => {
    try {
        const projectId = new mongodb.ObjectId(req.params.projectId);

        // Check if project exists
        const collection = db.collection("projects");
        const project = await collection.findOne({ _id: projectId });
        if (!project) {
            return res.status(400).json({ message: "Project does not exist." });
        }

        // Check if project is owned by user/admin
        if (project.userId.toString() != req.user.userId && !req.user.permission) {
            return res.status(401).json({ message: "Cannot view a project not owned by you." });
        }

        const projectDetails = {
            projectName: project.projectName,
            projectNumber: project.projectNumber,
            date: project.date,
            clientName: project.clientName || "-",  // "-" if not provided
            revisionNumber: project.revisionNumber || "-",  // "-" if not provided
            transportCo2Rate: project.transportCo2Rate
        };

        // Return success response
        res.status(200).json({ message: "Project details retrieved.", projectDetails });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to retrieve project details." });
    }
});

/** 
* Route to retrieve project data
* @name get/get-project-data/:projectId
* @param {string} projectId - Project id
* @returns {object} res.body.{ message, material: {tonnage, recycled, truck, plantCo2Rate, finalProductCo2Rate, landfillDist, plantDist} }
*/
router.get("/get-project-data/:projectId", auth_middleware, async (req, res) => {
    try {
        const projectId = new mongodb.ObjectId(req.params.projectId);

        // Check if project exists
        const collection = db.collection("projects");
        const project = await collection.findOne({ _id: projectId });
        if (!project) {
            return res.status(400).json({ message: "Project does not exist." });
        }

        // Check if project is owned by user/admin
        if (project.userId.toString() != req.user.userId && !req.user.permission) {
            return res.status(401).json({ message: "Cannot view a project not owned by you." });
        }

        const projectData = project.materials;

        // Return success response
        res.status(200).json({ message: "Project data retrieved.", projectData });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to retrieve project data." });
    }
});

/** 
* Route to delete a project
* @name delete/delete-project/:projectId
* @param {string} userId - User's id
* @param {string} projectId - Project's id
* @returns {object} res.body.{message}
*/
router.delete("/delete-project/:projectId", auth_middleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const projectId = new mongodb.ObjectId(req.params.projectId);

        const userCollection = db.collection("users");
        const projectCollection = db.collection("projects");

        // Verify user exists
        const userIdObj = new mongodb.ObjectId(userId);
        const existingUser = await userCollection.findOne({ _id: userIdObj });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if project exists 
        const project = await projectCollection.findOne({ _id: projectId });
        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        // Check if the project is owned by the user/admin
        if (project.userId.toString() !== userId && !req.user.permission) {
            return res.status(401).json({ message: "Cannot delete a project not owned by you." });
        }

        // Delete the project
        await projectCollection.deleteOne({ _id: projectId });

        // Return success response
        res.status(200).json({ message: "Project successfully deleted." });
    } catch (err) {
        console.error("Deletion error: ", err);
        res.status(500).json({ message: "Failed to delete project." });
    } 
});

export default router;