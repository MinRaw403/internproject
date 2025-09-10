// server/models/Department.js
const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        code: { type: String, required: true, unique: true, trim: true },
        description: { type: String, required: true, trim: true },
        dateCreated: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Department", DepartmentSchema);
