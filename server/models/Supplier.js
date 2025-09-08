const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    tp1: { type: String, required: true },
    tp2: { type: String }, // optional
    date: { type: String, required: true },
});

module.exports = mongoose.model('Supplier', SupplierSchema);
