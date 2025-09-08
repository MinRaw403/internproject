// server/models/IssueNote.js
const mongoose = require('mongoose');

const issueNoteSchema = new mongoose.Schema({
    department: { type: String, required: true },
    personName: { type: String, required: true },
    event: { type: String, required: true },
    item: { type: String, required: true },
    issuedDate: { type: Date, required: true },
    note: { type: String },
    code: { type: String, required: true },
    qty: { type: Number, default: 1, required: true }
}, { timestamps: true });

module.exports = mongoose.model('IssueNote', issueNoteSchema);
