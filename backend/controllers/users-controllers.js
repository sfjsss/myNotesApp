const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
            'emailError',
            422
        );
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        password: hashedPassword,
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

    let token;
    try {
        token = jwt.sign(
            {userId: createdUser._id, email: createdUser.email},
            'somekindofsecret',
            {expiresIn: '1h'}
        )
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    res.status(201).json({userId: createdUser._id, token: token});
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

    if (!existingUser) {
        const error = new HttpError(
            'credentialError',
            403
        );
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError(
            'credentialError',
            403
        )
        return next(error);
    }

    let token;
    try {
        token = jwt.sign(
            {userId: existingUser._id, email: existingUser.email},
            'somekindofsecret',
            {expiresIn: "1h"}
        )
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    res.json({userId: existingUser._id, token: token});
}

exports.signup = signup;
exports.login = login;