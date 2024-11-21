
/**
* @file Routes relating to table creation
* @route post/table_data
*/

import express from 'express';
import { calculate_value, find_project} from '../utils/calculate.js';
import { auth_middleware } from '../utils/jwt_session.js';

const router = express.Router();

/** 
* Route serving table data.
* @name post/table_data
* @param {string} projectID - ID of project to get data from
* @returns {object} res.body.{graphData}
*/
router.post("/table_data", auth_middleware, async (req, res) => {
    try {
        const { projectId } = req.body;
         //Validate ID
        if (!projectId) {
            return res.status(400).json({ message: "Project ID required"})
        }
        
        const project = await find_project(projectId)

        // Check if project is owned by user/admin
        if (project.userId.toString() != req.user.userId && !req.user.permission) {
            return res.status(401).json({ message: "Cannot view a project not owned by you." });
        }

        let materials = Object.keys(project.materials);
        let recycle_perc_data = []
        let reduction_tons_data = []
        let contribution_data = []
        let reduction_ratio_data = []

        let deposited_material = []
        let recycled_material = []
        let co2_em_trans_landfield = []
        let co2_em_trans_recyc = []
        let co2_em_prod = []
        let co2_em_recyc = []


        for (const material of materials) {
            recycled_material.push(calculate_value(project, 'total recycled material', material));
            deposited_material.push(calculate_value(project, 'total deposited material', material));

            co2_em_trans_landfield.push(calculate_value(project, 'landfield transportation co2', material));
            co2_em_trans_recyc.push(calculate_value(project, 'plant transportation co2', material));
            co2_em_prod.push(calculate_value(project, 'production co2', material));
            co2_em_recyc.push(calculate_value(project, 'recycling co2', material));
            reduction_tons_data.push(calculate_value(project, 'co2 reduction', material)) 
            contribution_data.push(calculate_value(project, 'contribution', material))
            reduction_ratio_data.push(calculate_value(project, 'co2 reduction ratio', material))
            recycle_perc_data.push(calculate_value(project, 'recycle percentage', material))
        }

        const total_reduction = calculate_value(project, 'total co2 reduction');
        const recycling_total = calculate_value(project, 'recycling total co2 emission');
        const transportation_total = calculate_value(project, 'transportation total co2 emission');
        const production_total = calculate_value(project, 'production total co2 emission');



        let finalData = {material: materials, total_recycled_material: recycled_material, total_deposited_material: deposited_material,
            co2_emmission_by_trans_landfield: co2_em_trans_landfield, co2_emmission_by_trans_recyc: co2_em_trans_recyc,
            co2_emm_for_production: co2_em_prod, co2_emm_for_recycling: co2_em_recyc, reduction_co2_tons: reduction_tons_data,
            contribution: contribution_data, reduction_ratio: reduction_ratio_data, recycled_percent: recycle_perc_data,
            total_co2_reduction: total_reduction, recyc_total: recycling_total,
            trans_total: transportation_total, prod_total: production_total
        }
        
        res.json(finalData);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error generating table data" });
    }
});

export default router;
