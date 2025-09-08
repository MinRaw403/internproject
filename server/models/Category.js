//server/models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    code: String,
    description: String,
    image: String, // ✅ Add this
}, { timestamps: true });

module.exports = mongoose.model("Category", CategorySchema);
