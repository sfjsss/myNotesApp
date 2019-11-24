const express = require('express');
const { check } = require('express-validator');

const notesControllers = require('../controllers/notes-controllers');

const router = express.Router();

router.post(
    '/',
    [
        check('title')
            .not()
            .isEmpty(),
        check('description')
            .isLength({min: 5})
    ],
    notesControllers.createNote
);

router.patch(
    '/:nid',
    [
        check('title')
            .not()
            .isEmpty(),
        check('description')
            .isLength({min: 5})
    ],
    notesControllers.updateNote
)

router.get('/:nid', notesControllers.getNoteById);

router.get('/user/:uid', notesControllers.getNotesByUserId);

router.delete('/:nid', notesControllers.deleteNote);

module.exports = router;