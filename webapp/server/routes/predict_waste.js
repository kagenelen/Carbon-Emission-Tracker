/**
* @file Route to predict demolition waste
* @route post/predict-waste
*/

import express from 'express';
import { db } from "../db/connection.js";  // MongoDB connection methods
import mongodb from 'mongodb';
import { auth_middleware } from '../utils/jwt_session.js';
import { material_composition, predict_with_model } from '../utils/calculate.js';

const router = express.Router();
/** 
* Route to generate project data from tensorflow model, serving /? route
* @name post/predict-waste
* @param {string} projectId - project's id
* @param {string} usage - building use purpose: education, office, retail, hospital, residential
* @param {float} gfa - gross floor area (m2)
* @param {float} volume - building volume (m3), optional
* @param {int} floor - number of floors
* @param {boolean} useMyData - use user's previous project data to predict waste composition
* @returns {object} res.body.{message, materialsData}
*/
router.post("/predict-waste", auth_middleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        let { projectId, usage, gfa, volume, floor, useMyData } = req.body;

        // Validate the input data
        if (!projectId || !usage || !gfa || !floor) {
            return res.status(400).json({ message: "Project Id, usage, gfa and floor are required fields." });
        }
        
        // Connect to the db
        const projectIdObj = new mongodb.ObjectId(projectId);

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

        // Predict total waste
        const totalWaste = predict_with_model(usage, gfa, volume, floor);

        // Figure out waste composition 
        let materialsData;
        const emptyData = {recycled: 0, truck: 10, plantCo2Rate: 500, finalProductCo2Rate: 750, landfillDist: 40, plantDist: 30};
        
        if (useMyData) {
            // Use user's previous project data average tonnage for each material (default categories only)
            const pComp = await material_composition(userId);
            materialsData = {
                Concrete: {tonnage: (totalWaste * (pComp['Concrete'] ?? 0 ) ).toFixed(2), ...emptyData},
                Brick: {tonnage: (totalWaste * (pComp['Brick'] ?? 0 ) ).toFixed(2), ...emptyData},
                'Black Iron': {tonnage: (totalWaste * (pComp['Black Iron'] ?? 0 ) ).toFixed(2), ...emptyData},
                PVC: {tonnage: (totalWaste * (pComp['PVC'] ?? 0 ) ).toFixed(2), ...emptyData},
                Copper: {tonnage: (totalWaste * (pComp['Copper'] ?? 0 ) ).toFixed(2), ...emptyData},

                'Mixed Metal Scrap': {tonnage: (totalWaste * (pComp['Mixed Metal Scrap'] ?? 0 ) ).toFixed(2), ...emptyData},
                Asbestos: {tonnage: (totalWaste * (pComp['Asbestos'] ?? 0 ) ).toFixed(2), ...emptyData},
                'Asbestos Soil': {tonnage: (totalWaste * (pComp['Asbestos Soil'] ?? 0 ) ).toFixed(2), ...emptyData},
                'Mixed Waste': {tonnage: (totalWaste * (pComp['Mixed Waste'] ?? 0 ) ).toFixed(2), ...emptyData},
                VENM: {tonnage: (totalWaste * (pComp['VENM'] ?? 0 ) ).toFixed(2), ...emptyData},
            };


        } else {
            // Use industry averages: https://www.researchgate.net/publication/330100663_CONSTRUCTION_AND_DEMOLITION_WASTE_STREAMS_FROM_THE_MATERIAL_RECOVERY_POINT_OF_VIEW_A_CASE_STUDY_OF_THE_SOUTH_KARELIA_REGION_FINLAND#pf5
            // Concrete + brick 34.1, Mixed metal scraps + iron + copper 31.6, PVC 3.9, Asbestos 0.8, Mixed waste 0.5 + 6.4, VENM = 22.7
            materialsData = {
                Concrete: {tonnage: (totalWaste * 0.171).toFixed(2), ...emptyData},
                "Mixed Metal Scrap": {tonnage: (totalWaste * 0.116).toFixed(2), ...emptyData},
                PVC: {tonnage: (totalWaste * 0.39).toFixed(2), ...emptyData},
                Asbestos: {tonnage: (totalWaste * 0.8).toFixed(2), ...emptyData},
                "Mixed Waste": {tonnage: (totalWaste * 0.69).toFixed(2), ...emptyData},
                VENM: {tonnage: (totalWaste * 0.227).toFixed(2), ...emptyData},
                Brick: {tonnage: totalWaste * 0.17, ...emptyData},
                'Black Iron': {tonnage: totalWaste * 0.10, ...emptyData},
                Copper: {tonnage: totalWaste * 0.10, ...emptyData},
                'Asbestos Soil': {tonnage: 0, ...emptyData}
            };


        }

        // Update project with predicted data
        await collection.updateOne({ _id: projectIdObj }, 
            { $set: {
                materials: materialsData
            }}
        );

        // Return success response
        res.status(200).json({ message: "Project data predicted and updated successfully", materialsData});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update project data." });
    }
});

export default router;