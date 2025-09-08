// server/routes/issueNotes.js
const express = require('express');
const router = express.Router();
const IssueNote = require('../models/IssueNote');

// GET all issue notes
router.get('/', async (req, res) => {
    try {
        const notes = await IssueNote.find().sort({ createdAt: -1 }); // Optional sort
        res.json({ success: true, notes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
