const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
        const token = req.query.auth;
        if (!token) {
            throw new Error('Authentication failed');
        }
        const decodedToken = jwt.verify(token, 'somekindofsecret');
        req.userData = {userId: decodedToken.userId};
        next();
    } catch (err) {
        const error = new HttpError(
            'failed to decode token',
            403
        )
        return next(error);
    }
}