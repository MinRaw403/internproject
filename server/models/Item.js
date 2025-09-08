//server/models/item.js

const mongoose = require('mongoose');
const userEvent = require("@testing-library/user-event");

const itemSchema = new mongoose.Schema({
    category: String,
    unitPrice: String,
    itemCode: { type: String, required: true, unique: true },
    unit: String,
    imagePath: String,
    rackNumber: String,
    supplier: String,
    reOrder: String,
    description: String,
});

module.exports = mongoose.model('Item', itemSchema);