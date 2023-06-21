const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

const Notes = require('../models/Note');

// Route 1: Get all the notes using : GET "/api/notes/fetchallnotes". login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
    }
})
// Route 2: Add a new  Note using : using "/api/notes/addnote". login required
router.post('/addnote', fetchuser, [body('title', "Title must contains at least 3 characters.").isLength({ min: 3 }), body('description', "description must contain at least 5 characters.").isLength({ min: 5 }),], async (req, res) => {
    // if there are errors return bad request and the errors
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, description, tag } = req.body;
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save();
        res.json(savedNote);
    } catch (error) {
        res.status(500).send("Internal server error occured.");
    }
})
// Route 3: Update Note : using "/api/notes/updatenote". login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        // Create a new note object.
        const newNote = {};
        if (title) { newNote.title = title }
        if (description) { newNote.description = description }
        if (tag) { newNote.tag = tag }

        // Find the note and update it.
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Note not found.") }
        if (note.user.toString() !== req.user.id) { return res.status(401).send("Unauthorized Request.") }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({ note });
    } catch (error) {
        res.status(500).send("Internal server error occured.");
    }
})
// Route 4: Delete Note using : using "/api/notes/deletenote". login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Find the note and delete it.
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Note not found.") }
        if (note.user.toString() !== req.user.id) { return res.status(401).send("Unauthorized Request.") }
        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ "Suscess": "Note has been deleted", note: note });
    } catch (error) {
        res.status(500).send("Internal server error occured.");
    }
})
module.exports = router