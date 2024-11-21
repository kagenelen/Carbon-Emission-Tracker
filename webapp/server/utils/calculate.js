/**
* @file Helper function for calculating co2 reduction values. Called by graphs and tables
* You need to pass these functions a PROJECT RECORD from the database!
* These formulas are taken from the excel spreadsheet that the client provided
* 
* Below is the functions you need from this spreadsheet for calculations
* @function calculate_value (project, category, material=None) Function to call the appropriate calculation function for a category
* @function find_project (projectId) Retrieve project record
* @function material_composition (userId) Get percentage composition of material tonnage for all projects of a user
* @function predict_with_model (usage, gfa, volume, floor) Calls python program to run the model
* 
* Below is functions to calculate spreadsheet values
* @function total_weight (project, material)
* @function recycle_percentage (project, material)
* @function total_recycled_material (project, material)
* @function total_deposited_material (project, material)
* @function plant_co2_rate (project, material) reycling plant co2 emission rate
* @function final_product_co2_rate (project, material) final product production co2 emission rate
* @function landfill_dist (project, material) ave. distance to landfill
* @function plant_dist (project, material) ave. distance to recycling plant
* @function truck_num (project, material)
* @function landfield_transportation_co2 (project, material) co2 emission by transportation (to landfield)
* @function plant_transportation_co2 (project, material) co2 emission by transportation (to recycling plant)
* @function production_co2 (project, material) co2 emission for production
* @function recycling_co2 (project, material) co2 emission for recycling
* @function co2_reduction (project, material) reduction in co2
* @function contribution (project, material)
* @function total_co2_reduction (project)
* @function co2_reduction_ratio (project, material) reduction in co2 ratio
* @function recycling_total_co2_emission (project)
* @function transportation_total_co2_emission (project)
* @function production_total_co2_emission (project)
* 
* @function get_average_recycling (project) Average recycling for a project
* @function leaderboard_stats Calculate leaderboard data
* @function numberfy Helper function convert NaN to 0, round to 2 decimal places, convert to int, not exported
*/

import { db } from "../db/connection.js";  // MongoDB connection methods
import mongodb from 'mongodb';
import { spawnSync } from 'node:child_process';

/** 
* Helper factory function to calculate any parameter
* @param {obj} project - Project object
* @param {string} category - Name of parameter you want to calculate, e.g. 'co2 reduction'
* @param {string} material - [optional] Material name, exact case
* @returns {int} Results of calculation or None if invalid category or material
* @throws 'Not a valid material for this project' if material does not exist
* @throws 'Not a valid calculation category' if calculation function is not valid
*/
export function calculate_value(project, category, material=null ) {
    if (material != null && !(material in project.materials)) {
        throw new Error('Not a valid material for this project')
    }

    let res;
    switch(category) {
        case 'total weight':
            res = total_weight(project, material);
            break;
        case 'recycle percentage':
            res = recycle_percentage(project, material);
            break;
        case 'total recycled material':
            res = total_recycled_material(project, material);
            break;
        case 'total deposited material':
            res = total_deposited_material(project, material);
            break;
        case 'plant co2 rate':
            res = plant_co2_rate(project, material);
            break;
        case 'final product co2 rate':
            res = plant_co2_rate(project, material);
            break;
        case 'landfill dist':
            res = landfill_dist(project, material);
            break;
        case 'plant dist':
            res = plant_dist(project, material);
            break;
        case 'truck num':
            res = truck_num(project, material);
            break;
        case 'landfield transportation co2':
            res = landfield_transportation_co2(project, material);
            break;
        case 'plant transportation co2':
            res = plant_transportation_co2(project, material);
            break;
        case 'production co2':
            res = production_co2(project, material);
            break;
        case 'recycling co2':
            res = recycling_co2(project, material);
            break;
        case 'co2 reduction':
            res = co2_reduction(project, material);
            break;
        case 'contribution':
            res = contribution(project, material);
            break;
        case 'total co2 reduction':
            res = total_co2_reduction(project);
            break;
        case 'co2 reduction ratio':
            res = co2_reduction_ratio(project, material);
            break;
        case 'recycling total co2 emission':
            res = recycling_total_co2_emission(project);
            break;
        case 'transportation total co2 emission':
            res = transportation_total_co2_emission(project);
            break;
        case 'production total co2 emission':
            res = production_total_co2_emission(project);
            break;
        default:
            throw new Error('Not a valid calculation category')
    }
    return res;
}

/** 
* Helper function to retrieve project record from database
* @param {string} projectId - Project's id
* @returns {object} project record object or {} if project doesn't exist
*/
export async function find_project(projectId) {
    try {

        // Check if project exists and retrieve it
        const projectIdObj = new mongodb.ObjectId(projectId);
        const collection = db.collection("projects");
        const project = await collection.findOne({ _id: projectIdObj });

        if (db) {
            //await closeConnection();
          }

        if (!project) {
            return {};
        }

        // Return project record
        return project;
    }
    catch (err) {
        console.error(err);
    }
}

/** 
* Get percentage composition of material tonnage for all projects of a user
* @param {object} userId - User's id
* @returns {object} {material: percentage composition}
*/
export async function material_composition(userId) {
    try {
        // Connect to the db

        // Check if project exists and retrieve it
        const userIdObj = new mongodb.ObjectId(userId);
        const collection = db.collection("projects");
        const projects = await collection.find({ userId: userIdObj }).toArray();

        // Extract tonnage of each material of each project into a list of objects
        const allProjectsMaterials = projects.map(project => {
            
            if (project.materials) {
                // tonnageObject is {material: tonnage}
                const tonnageObject = {};
                for (const [material, data] of Object.entries(project.materials)) {
                    tonnageObject[material] = data.tonnage;
                }
                return tonnageObject;

            } else {
                return null;
            }
        }).filter(materials => materials !== null); // Filter out any null entries

        // Calculate sum and count of each material
        const averages = allProjectsMaterials.reduce((cal, curr) => {
            // Iterate over each material in the current object
            for (const [material, tonnage] of Object.entries(curr)) {
                if (!cal[material]) {
                    cal[material] = { sum: 0, count: 0 };
                }
                cal[material].sum += tonnage;
                cal[material].count += 1;
            }
            return cal;
        }, {});
        
        // Find average of each material using sum and count
        for (const material in averages) {
            averages[material] = averages[material].sum / averages[material].count;
        }

        // Calculate the total of all averages
        const totalAverage = Object.values(averages).reduce((acc, avg) => acc + avg, 0);

        // Calculate percentage of each material's average in relation to total averages
        const percentageComp = {};
        for (const [material, avg] of Object.entries(averages)) {
            percentageComp[material] = avg / totalAverage;
        }

        // Return composition object
        return percentageComp
    }
    catch (err) {
        console.error(err);
    }
}

/** 
* Call tensorflow py saved model with inputs
* @param {int} usage - Building usage purpose
* @param {float} gfa - Gross floor area
* @param {float} volume - Building volume (optional)
* @param {int} floor - Number of floors
* @returns {float} total demolition waste in tons
*/
export function predict_with_model(usage, gfa, volume, floor) {
    // Convert usage string to respective int
    let usageInt;
    switch(usage) {
        case 'education':
            usageInt = 1
            break;
        case 'office':
            usageInt = 2
            break;
        case 'retail':
            usageInt = 3
            break;
        case 'hospital':
            usageInt = 4
            break;
        case 'residential':
            usageInt = 5
            break;
        default:
            usageInt = 1
    }

    // Calculate volume using average floor height (2.8m) if not given
    if (!volume) {
        volume = floor * gfa * 2.8;
    }

    // Find total waste generated according to usage, gfa, volume and floor
    const inputs = ['./utils/use_model.py', '-u', usageInt, gfa, volume, floor];
    // spawnSync('python3', inputs, { stdio: 'inherit'}, { encoding: 'utf-8' }); // Checking console output 
    const pythonProcess = spawnSync('python3', inputs);
    const totalWaste = parseFloat(pythonProcess.stdout.toString());

    return totalWaste
}

/** 
* Calculates total recycled material for a material
* @param {object} project - Project object
* @param {string} material - exact case as written by user
* @returns {int} total recycled material (tons)
*/
function total_recycled_material(project, material) {
    // Total weight * recycle percentage / 100

    let sum =  total_weight(project, material) *  recycle_percentage(project, material);
    sum = sum / 100;
    return numberfy(sum);
}

/** 
* Calculates total deposited material for a material
* @param {string} project - Project object
* @param {string} material - exact case as written by user
* @returns {int} total deposited material (tons)
*/
function total_deposited_material(project, material) {
    // (100 - recycle percentage) * total weight / 100   

    let sum = ( 100 -  recycle_percentage(project, material) ) *  total_weight(project, material);
    sum = sum / 100;
    return numberfy(sum);
}

/** 
* Calculates co2 emission by transportation (to landfield) for a material
* @param {string} project - Project object
* @param {string} material - exact case as written by user
* @returns {int} co2 emission by transportation to landfield (kg)
*/
function landfield_transportation_co2(project, material) {
    // Concrete: Transport CO2 rate * truck no. * dist to landfill * total deposited material /  total weight
    // Else: Transport CO2 rate * truck no. * dist to landfill * total weight /  total weight * (100 - recycle percentage) / 100
    let sum = project.transportCo2Rate *  truck_num(project, material) *  landfill_dist(project, material);
    if (material.toLowerCase() == 'concrete') {
        sum = sum *  total_deposited_material(project, material) /  total_weight(project, material);
    } else {
        sum = sum *  total_weight(project, material) /  total_weight(project, material);
        sum = sum * ( 100 - recycle_percentage(project, material) ) / 100;
    }
    return numberfy(sum);
}

/** 
* Calculates co2 emission by transportation (to recycling plant) for a material
* @param {object} project - Project object
* @param {string} material - exact case as written by user
* @returns {int} co2 emission by transportation to recycling plant (kg)
*/
function plant_transportation_co2(project, material) {
    // Concrete: Transport CO2 rate * truck no. * dist to recycling plant * total recycled material / total weight
    // Else: Transport CO2 rate * truck no. * dist to recycling plant * total recycled material / total weight * recycle percentage / 100 

    let sum = project.transportCo2Rate * truck_num(project, material) * plant_dist(project, material);
    sum = sum * total_recycled_material(project, material); 
    
    if (material.toLowerCase != 'concrete') {
        sum = sum / total_weight(project, material) * recycle_percentage(project, material);
        sum = sum / 100;
    } else {
        sum = sum / total_weight(project, material);
    }
    return numberfy(sum);
}

/** 
* Calculates co2 emission for production for a material
* @param {object} project - Project object
* @param {string} material - exact case as written by user
* @returns {int} co2 emission for production (kg)
*/
function production_co2(project, material) {
    // Final product CO2 rate * total recycled material

    let sum = final_product_co2_rate(project, material) * total_recycled_material(project, material);
    return numberfy(sum);
}

/** 
* Calculates co2 emission for recycling for a material
* @param {object} project - Project object
* @param {string} material - exact case as written by user
* @returns {int} co2 emission for recycling (kg)
*/
function recycling_co2(project, material) {
    // Recycling plant CO2 rate * total weight * recycle percentage / 100

    let sum = plant_co2_rate(project, material) * total_weight(project, material) * recycle_percentage(project, material) / 100
    return numberfy(sum);
}

/** 
* Calculates reduction in co2 emission for a material
* @param {object} project - Project object
* @param {string} material - exact case as written by user
* @returns {int} reduction in co2 emission (ton)
*/
function co2_reduction(project, material) {
    // [Production CO2 - (Landfield transportation CO2 + recycling CO2 + plant transportation CO2)] / 1000

    let sum = landfield_transportation_co2(project, material) + recycling_co2(project, material) + plant_transportation_co2(project, material);
    sum = production_co2(project, material) - sum;
    sum = sum / 1000;
    return numberfy(sum);
}

/** 
* Calculates contribution for a material
* @param {object} project - Project object
* @param {string} material - exact case as written by user
* @returns {int} contribution
*/
function contribution(project, material) {
    // CO2 reduction / total CO2 reduction * 100

    let sum = co2_reduction(project, material) / total_co2_reduction(project) * 100;
    return numberfy(sum);
}

/** 
* Calculates total co2 reduction using all materials
* @param {object} project - Project object
* @returns {int} total co2 reduction (ton)
*/
function total_co2_reduction(project) {
    // Sum(co2 reduction COL)

    let sum = 0;
    let materials = Object.keys(project.materials)
    for (let material of materials) {
        sum = sum + co2_reduction(project, material);
    }
    return numberfy(sum);
}

/** 
* Calculates reduction in co2 ratio for a material
* @param {object} project - Project object
* @param {string} material - exact case as written by user
* @returns {int} reduction in co2 ratio (ton/ton)
*/
function co2_reduction_ratio(project, material) {
    // CO2 reduction / total weight

    let sum = co2_reduction(project, material) / total_weight(project, material);
    return numberfy(sum);
}

/** 
* Calculates recycling: total co2 emission, using all materials
* @param {object} project - Project object
* @returns {int} recycling: total co2 emission (ton)
*/
function recycling_total_co2_emission(project) {
    // Sum(Recycling Co2 Emission COL)/1000

    let sum = 0;
    let materials = Object.keys(project.materials)
    for (let material of materials) {
        sum = sum + recycling_co2(project, material);
    }
    sum = sum / 1000;
    return numberfy(sum);
}

/** 
* Calculates transportation: total co2 emission
* @param {object} project - Project object
* @returns {int} transportation: total co2 emission (ton)
*/
function transportation_total_co2_emission(project) {
    // Sum(Landfield tansportation CO2 COL + plant transportation CO2 COL)/1000    

    let sum = 0;
    let materials = Object.keys(project.materials)
    for (let material of materials) {
        sum = sum + landfield_transportation_co2(project, material) + plant_transportation_co2(project, material);
    }
    sum = sum / 1000;
    return numberfy(sum);
}

/** 
* Calculates production: total co2 emission
* @param {object} project - Project object
* @returns {int} production: total co2 emission (ton)
*/
function production_total_co2_emission(project) {
    // Sum(Production CO2 COL)/1000

    let sum = 0;
    let materials = Object.keys(project.materials)
    for (let material of materials) {
        sum = sum + production_co2(project, material);
    }
    sum = sum / 1000;
    return numberfy(sum);
}

/** 
* Gets recycling plant co2 emission rate for a material
* @param {object} project - Project object
* @param {object} material - exact case as written by user
* @returns {int} recycling plant co2 emission rate (kg co2/ton)
*/
function plant_co2_rate(project, material) {
    // From input or default value
    return Number(project.materials[material].plantCo2Rate);
}

/** 
* Gets final product production co2 emission rate for a material
* @param {object} project - Project object
* @param {object} material - exact case as written by user
* @returns {int} final product production co2 emission rate (kg co2/ton)
*/
function final_product_co2_rate(project, material) {
    // From input or default value
    return Number(project.materials[material].finalProductCo2Rate);
}

/** 
* Gets average distance to landfill for a material
* @param {object} project - Project object
* @param {object} material - exact case as written by user
* @returns {int} average distance to landfill (km)
*/
function landfill_dist(project, material) {
    // From input or default value
    return Number(project.materials[material].landfillDist);
}

/** 
* Gets average distance to recycling plant for a material
* @param {object} project - Project object
* @param {object} material - exact case as written by user
* @returns {int} average distance to recycling plant (km)
*/
function plant_dist(project, material) {
    // From input or default value
    return Number(project.materials[material].plantDist);
}

/** 
* Gets truck num for a material 
* @param {object} project - Project object
* @param {object} material - exact case as written by user
* @returns {int} truck num
*/
function truck_num(project, material) {
    // From input 
    return Number(project.materials[material].truck);
}

/** 
* Gets total weight of a material
* @param {object} project - Project object
* @param {string} material - exact case as written by user
* @returns {int} total weight in tons
*/
function total_weight(project, material) {
    // From input
    return Number(project.materials[material].tonnage);
}

/** 
* Gets recycle percentage for a material
* @param {object} project - Project object
* @param {string} material - exact case as written by user
* @returns {int} recycle percentage (%)
*/
function recycle_percentage(project, material) {
    // From input
    return Number(project.materials[material].recycled);
}

/**
 * Helper function to get recycling % 
 * for each project
 * @param {project}
 * @returns {int}
 */
function get_average_recycling(project) {
    let sum = 0;
    let num_materials = 0;
    
    for (let material in project.materials) {
        if (project.materials[material].recycled !== undefined) {
            sum += project.materials[material].recycled;
            num_materials += 1;
        }
    }
    if (num_materials > 0) {
        sum = sum / num_materials;
    }

    return numberfy(sum);
}

/**
 * Function to return leaderboard results.
 * Function gets all projects 
 * It then finds the average recycling rate per user, and the 
 * total reduction. 
 * @returns {array} of items {user, total reduction, average recycling %}
 */
export async function leaderboard_stats() {
    try {
        const projectsCollection = db.collection("projects");
        const users = db.collection("users");

        const projects = await projectsCollection.find().toArray(); // Await the projects
        let leaderboardData = [];

        for (const doc of projects) {
            const projectIdObj = new mongodb.ObjectId(doc._id);
            const project = await projectsCollection.findOne({ _id: projectIdObj });

            let reduction = total_co2_reduction(project);
            let recyc_average = get_average_recycling(project);

            leaderboardData.push({
                reduction_data: reduction,
                userId: project.userId,
                recyc: recyc_average
            });
        }

        let userAggregate = {};

        leaderboardData.forEach(data => {
            let { userId, reduction_data, recyc } = data;

            if (!userAggregate[userId]) { //initalise data, for users with no projects 
                userAggregate[userId] = {
                    totalReduction: 0,
                    totalRecyc: 0,
                    projectCount: 0
                };
            }
            userAggregate[userId].totalReduction += reduction_data;
            userAggregate[userId].totalRecyc += recyc;
            userAggregate[userId].projectCount += 1;
        });

        let finalLeaderboard = [];

        for (const userId of Object.keys(userAggregate)) {
            let { totalReduction, totalRecyc, projectCount } = userAggregate[userId];
            const userDoc = await users.findOne({ _id: new mongodb.ObjectId(userId) });
            finalLeaderboard.push({
                userId: userDoc ? userDoc.name : 0, 
                averageRecyc: projectCount > 0 ? totalRecyc / projectCount : 0, // if project count > 0 then get average, else 0 to avoid nan
                totalReduction: totalReduction
            });
        }

        //need to - get user name, return in order of total reduction in CO2 
        finalLeaderboard.sort((a, b) => b.totalReduction - a.totalReduction);
        return finalLeaderboard;

    } catch (err) {
        console.log(err);
    }
}


/** 
* Helper function convert NaN to 0, round to 2 decimal places, convert to int
* @param {int} value calculation result, may be NaN
* @returns {int} non NaN value
*/
function numberfy(value){
    value = Number(value) || 0;
    return +value.toFixed(2);
}
