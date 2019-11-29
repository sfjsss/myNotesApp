const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const Note = require('../models/note');

const createNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid input', 422)
        );
    }

    const { title, description, creator } = req.body;

    if (creator !== req.userData.userId) {
        const error = new HttpError(
            'You are not the creator',
            401
        )
        return next(error);
    }

    const createdNote = new Note({
        title,
        description,
        creator,
        deleted: false
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError(
            'something went wrong, please try again later',
            500
        );
        return next(error);
    }

    if (!user) {
        const error = new HttpError('could not find the user', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdNote.save({session: sess});
        user.notes.push(createdNote);
        await user.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'something went wrong in the last step',
            500
        );
        return next(error);
    }

    res.status(201).json({note: createdNote.toObject()});
}

const getNoteById = async (req, res, next) => {
    const noteId = req.params.nid;

    let note;
    try {
        note = await Note.findById(noteId).populate('sharedUsers').populate('creator');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, cannot locate the note.',
            500
        );
        return next(error);
    }

    if (!note) {
        const error = new HttpError(
            'Could not find a note',
            404
        );
        return next(error);
    }

    res.json({note: note.toObject()});
}

const getNotesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    if (userId !== req.userData.userId) {
        const error = new HttpError(
            'You are not the creator',
            401
        )
        return next(error);
    }

    let userWithNotes;
    try {
        userWithNotes = await User.findById(userId).populate('notes').populate('sharedNotes');
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        );
        return next(error);
    }

    if (!userWithNotes) {
        return next(
            new HttpError('user cannot be found', 404)
        )
    }

    res.json({notes: userWithNotes.notes.map(note => note.toObject()), sharedNotes: userWithNotes.sharedNotes.map(sharedNote => sharedNote.toObject())});
}

const updateNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('invalid input', 422)
        )
    }

    const { title, description } = req.body;
    const noteId = req.params.nid;

    let note;
    try {
        note = await Note.findById(noteId);
    } catch(err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    note.title = title;
    note.description = description;

    try {
        await note.save();
    } catch(err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    res.status(200).json({note: note.toObject()});
}

const shareNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid input', 422)
        );
    }
    
    const noteId = req.params.nid;

    let note;
    try {
        note = await Note.findById(noteId);
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    if (!note) {
        const error = new HttpError(
            'could not find the note',
            404
        )
        return next(error);
    }

    if (note.creator.toString() !== req.userData.userId) {
        const error = new HttpError(
            'you are not the creator',
            401
        )
        return next(error);
    }

    const { email } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError(
            'invalidEmail',
            403
        )
        return next(error)
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        note.sharedUsers.push(existingUser);
        await note.save({session: sess});
        existingUser.sharedNotes.push(note);
        await existingUser.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    res.status(200).json({message: 'note shared'});
}

const unshareNote = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid input', 422)
        )
    }

    const noteId = req.params.nid;

    let note;
    try {
        note = await Note.findById(noteId);
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    if (!note) {
        const error = new HttpError(
            'could not find the note',
            404
        )
        return next(error);
    }

    if (note.creator.toString() !== req.userData.userId) {
        const error = new HttpError(
            'you are not the creator',
            401
        )
        return next(error);
    }

    const { userId } = req.body;

    let existingUser;
    try {
        existingUser = await User.findById(userId);
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError(
            'invalid userId',
            403
        )
        return next(error)
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        note.sharedUsers.pull(existingUser);
        await note.save({session: sess});
        existingUser.sharedNotes.pull(note);
        await existingUser.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    res.status(200).json({message: 'note unshared'});
}

const restoreNote = async (req, res, next) => {
    const noteId = req.params.nid;

    let note;
    try {
        note = await Note.findById(noteId);
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    if (!note) {
        const error = new HttpError(
            'could not find the note',
            404
        )
        return next(error);
    }

    if (note.creator.toString() !== req.userData.userId) {
        const error = new HttpError(
            'You are not the creator',
            401
        )
        return next(error);
    }

    note.deleted = false;

    try {
        await note.save();
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    res.status(200).json({note: note.toObject()});
}

const removeNote = async (req, res, next) => {
    const noteId = req.params.nid;

    let note;
    try {
        note = await Note.findById(noteId);
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        );
        return next(error);
    }

    if (!note) {
        const error = new HttpError(
            'could not find the note',
            404
        )
        return next(error);
    }

    if (note.creator.toString() !== req.userData.userId) {
        const error = new HttpError(
            'You cannot remove the note',
            401
        )
        return next(error);
    }

    note.deleted = true;

    try {
        await note.save();
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    res.status(200).json({note: note.toObject()});
}

const deleteNote = async (req, res, next) => {
    const noteId = req.params.nid;

    let note;
    try {
        note = await Note.findById(noteId).populate('creator');
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        );
        return next(error);
    }

    if (!note) {
        const error = new HttpError(
            'could not find the note',
            404
        )
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await note.remove({session: sess});
        note.creator.notes.pull(note);
        await note.creator.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'something went wrong',
            500
        )
        return next(error);
    }

    res.status(200).json({message: 'note deleted'});
}

exports.createNote = createNote;
exports.getNoteById = getNoteById;
exports.getNotesByUserId = getNotesByUserId;
exports.updateNote = updateNote;
exports.deleteNote = deleteNote;
exports.removeNote = removeNote;
exports.restoreNote = restoreNote;
exports.shareNote = shareNote;
exports.unshareNote = unshareNote;