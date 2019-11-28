const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    deleted: {type: Boolean, required: true},
    creator: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    sharedUsers: [{type: mongoose.Types.ObjectId, required: true, ref: 'User'}]
}, {timestamps: true});

module.exports = mongoose.model('Note', noteSchema);