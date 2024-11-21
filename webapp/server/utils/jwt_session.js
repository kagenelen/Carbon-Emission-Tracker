/**
* @file Helper function relating to jwt session tokens
* @function create_jwt
* @function decode_jwt Verifies and decodes jwt
* @function auth_middleware Express route middleware for jwt validating and decrypting
*/

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/** 
* Creates a 24h expiry jwt with userId, userName and permission as payload, then signs it.
* @param {string} userId - User's id, specified by mongodb
* @param {string} userName - User's name
* @param {integer} permission - 0 for admin, 1 for user
* @returns {string} jwt token
*/
export function create_jwt(userId, userName, permission) {
    const payload = {
        userId: userId,
        userName: userName,
        permission: permission
    }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' }); // Expiry 1 day

    return token;
}

/** 
* Verifies JWT signature and checks expiry. Then decode JWT to get payload.
* @param {string} token - JWT token
* @returns {object} payload{userId, userName, permission} or {} if invalid or expired token
*/
export function decode_jwt(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return {};
    }
}

/** 
 * Express middleware to check session and decode jwt
 * @param {object} req - Express request object
 * @param {string} req.headers.authorization - Authorization header containing the Bearer token (e.g., "Bearer <token>")
 * @param {object} res - Express response object
 * @returns {object} res.user - JSON response containing decoded payload {userId, userName, permission}
 * @throws {401} If the access token is missing or invalid
 */
export function auth_middleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access token required' });
    }

    // Extract token from header
    const token = authHeader.split(' ')[1];

    const payload = decode_jwt(token);
    if (Object.keys(payload).length == 0) {
        return res.status(401).json({ message: 'Invalid or expired session token.'})
    }
    req.user = payload;

    // You can access data from this via e.g. req.user.userId
    next();
}

