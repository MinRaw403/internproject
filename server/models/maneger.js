// internproject/server/models/Maneger.js

const mongoose = require("mongoose");

const manegerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: false,
    },
    username: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    department: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "manager",
    },
});

module.exports = mongoose.model("Maneger", manegerSchema);
