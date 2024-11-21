
/**
* @file Routes relating to table creation
* @route post/leaderboard_data
*/

import express from 'express';
const router = express.Router();
import { leaderboard_stats } from '../utils/calculate.js';
/** 
* Route serving table data.
* @name post/leaderboard_data
* @param {none}
* @returns {object} array of leaderboard data
*/
router.post("/leaderboard_data", async (req, res) => {
    try {
        let leaderboard_data = await leaderboard_stats();
        res.json(leaderboard_data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error generating leaderboard data" });
    }
});

export default router;
