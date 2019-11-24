const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Your input is invalid, please check your submission.', 422)
        );
    }
    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email})
    } catch (err) {
        const error = new HttpError(
            'Something went wrong during sign up, please try later.',
            500
        );
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError(
            'User with this email is already exist, please use another email',
            422
        );
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        password,
        notes: [],
        sharedNotes: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong during signup, please try again later.',
            500
        );
        return next(error);
    }

    res.status(201).json({user: createdUser.toObject()});
}

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email})
    } catch (err) {
        const error = new HttpError(
            'Something went wrong during login, please try again later.',
            500
        );
        return next(error);
    }

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError(
            'Invalid credentials',
            401
        );
        return next(error);
    }

    res.json({message: 'logged in'});
}

exports.signup = signup;
exports.login = login;