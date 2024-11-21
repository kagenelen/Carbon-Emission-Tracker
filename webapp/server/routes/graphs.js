/**
* @file Routes relating to graphs
* @route post/reductionChart
* @route post/ratioChart
* @route post/reductionPie
* @route post/emissionPie
* @route post/getMaterials
*/

import express from 'express';
import { find_project, calculate_value} from '../utils/calculate.js';



const router = express.Router();

router.get('/graphs', (req, res) => {
  res.status(200).send('Graph route working!');
});

/** 
* Route to calculate data for CO2 emission reduction bar graph
* @name post/reductionChart
* @param {string} projectID - ID of project to get data from
* @returns {object} res.body.{message, graphData}
*/
router.post("/reductionChart", async (req, res) => {

  try {      
    const {projectID} = req.body;

    //Validate ID
    if (!projectID) {
      return res.status(400).json({ message: "Project ID required"})
    }

    //extract project data
    const project = await find_project(projectID);

    if (!project) {
      return res.status(400).json({ message: "The requested project could not be found"})
    }

    //format data
    const graphMats = [{}];
    const graphVals = [{}];
    let i = 0;
    for (const material in project.materials) {
        const value = calculate_value(project, 'co2 reduction', material)       
        graphMats[i] = material;
        graphVals[i++] = value
    }

    // Return success response
    return res.status(201).json({ message: "Data calculated successfully", values: graphVals, materials: graphMats});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error generating graph data" });
  } finally {
    return;
  }

});

/** 
* Route to calculate data for CO2 emission reduction ratio bar graph
* @name post/ratioChart
* @param {string} projectID - ID of project to get data from
* @returns {object} res.body.{message, graphData}
*/
router.post("/ratioChart", async (req, res) => {

  try {      
    const {projectID} = req.body;

    //Validate ID
    if (!projectID) {
      return res.status(400).json({ message: "Project ID required"})
    }

    //extract project data
    const project = await find_project(projectID);

    if (!project) {
      return res.status(400).json({ message: "The requested project could not be found"})
    }

    //format data
    const graphMats = [{}];
    const graphVals = [{}];
    let i = 0;
    for (const material in project.materials) {
        const value = calculate_value(project, 'co2 reduction ratio', material)       
        graphMats[i] = material;
        graphVals[i++] = value
    }

    // Return success response
    return res.status(201).json({ message: "Data calculated successfully", values: graphVals, materials: graphMats});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error generating graph data" });
  } finally {
    return;
  }

});

/** 
* Route to calculate data for CO2 emission reduction pie chart
* @name post/reductionPie
* @param {string} projectID - ID of project to get data from
* @returns {object} res.body.{message, graphData}
*/
router.post("/reductionPie", async (req, res) => {

    try {      
      const {projectID} = req.body;

      //Validate ID
      if (!projectID) {
        return res.status(400).json({ message: "Project ID required"})
      }

      //extract project data
      const project = await find_project(projectID);

      if (!project) {
        return res.status(400).json({ message: "The requested project could not be found"})
      }

      //format data
      const graphData = [{value:1, label:'a'}, {value:2, label:'b'}];
      let i = 0;
      for (const material in project.materials) {
          const value = calculate_value(project, 'contribution', material)
          graphData[i++] = {value: value, label:material};
      }

      // Return success response
      return res.status(201).json({ message: "Data calculated successfully", data: graphData});
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error generating graph data" });
    } finally {
      return;
    }

});

/** 
* Route to calculate data for CO2 emission pie chart
* @name post/emissionPie
* @param {string} projectID - ID of project to get data from
* @returns {object} res.body.{message, graphData}
*/
router.post("/emissionPie", async (req, res) => {

  try {      
    const {projectID} = req.body;

    //Validate ID
    if (!projectID) {
      return res.status(400).json({ message: "Project ID required"})
    }

    //extract project data
    const project = await find_project(projectID);

    if (!project) {
      return res.status(400).json({ message: "The requested project could not be found"})
    }

    //format data
    const graphData = [{value:1, label:'a'}, {value:2, label:'b'}];
    graphData[0] = {value:calculate_value(project, 'recycling total co2 emission'), label:'Recycling'};
    graphData[1] = {value:calculate_value(project, 'transportation total co2 emission'), label:'Transportation'};
    graphData[2] = {value:calculate_value(project, 'production total co2 emission'), label:'Production'};

    // Return success response
    return res.status(201).json({ message: "Data calculated successfully", data: graphData});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error generating graph data" });
  } finally {
    return;
  }

});

/** 
* Route to a list of project materials
* @name post/getMaterials
* @param {string} projectID - ID of project to get data from
* @returns {object} res.body.{message, data}
*/
router.post("/getMaterials", async (req, res) => {

  try {      
    const {projectID} = req.body;

    //Validate ID
    if (!projectID) {
      return res.status(400).json({ message: "Project ID required"})
    }

    //extract project data
    const project = await find_project(projectID);

    if (!project) {
      return res.status(400).json({ message: "The requested project could not be found"})
    }

    //get list of materials
    let materials = [];
    
    for (let material in project.materials) {
      materials.push(material);
    }

    // Return success response
    return res.status(201).json({ message: "Successfully retrieved material list", data: materials});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error retrieving material list" });
  } finally {
    return;
  }

});

export default router;