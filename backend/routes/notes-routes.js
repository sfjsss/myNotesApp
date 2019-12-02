const express = require('express');
const { check } = require('express-validator');

const notesControllers = require('../controllers/notes-controllers');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);

router.patch(
    '/share/:nid',
    [
        check('email')
            .normalizeEmail()
            .isEmail()
    ],
    notesControllers.shareNote
);

router.patch(
    '/unshare/:nid',
    [
        check('userId')
            .not()
            .isEmpty()
    ],
    notesControllers.unshareNote
)

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

router.get('/restore/:nid', notesControllers.restoreNote);

router.get('/:nid', notesControllers.getNoteById);

router.get('/user/:uid', notesControllers.getNotesByUserId);

router.delete('/remove/:nid', notesControllers.removeNote);

router.delete('/:nid', notesControllers.deleteNote);

module.exports = router;