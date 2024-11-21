/**
* @file Routes relating to session authentication
* @route post/verify
*/

import express from 'express';
import { decode_jwt } from '../utils/jwt_session.js';

const router = express.Router();

/** 
* Route to verify JWT session tokens. 
* @name post/verify
* @param {string} token - JWT token to be verified
* @returns {object} res.body.{message}
*/
router.post("/verify", async (req, res) => {
    const { token } = req.body;
    const payload = decode_jwt(token);

    if (!payload) {
        return res.status(401).json({message: "Invalid or expired session token."})
    }
    return res.status(200).json(payload);
});

export default router;