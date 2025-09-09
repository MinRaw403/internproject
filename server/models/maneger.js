//models/maneger.js

const mongoose = require('mongoose');

const manegerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Maneger',manegerSchema);
