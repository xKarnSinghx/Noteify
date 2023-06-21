const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { authtoken } = require('ngrok');
const fetchuser = require("../middleware/fetchuser")

const JWT_SECRET = "karn";

// Route 1: Create a User using : POST "/api/auth/createuser". No login required
router.post('/createuser', [
    body('name', "Enter a Valid Name.").isLength({ min: 3 }),
    body('email', "Enter a Valid Email.").isEmail(),
    body('password', "Enter a Valid Password.").isLength({ min: 5 }),

], async (req, res) => {
    let success=false;
    // if there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // check whether the user with this email exist already
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({success, error: "Sorry a user with this email already exist." })
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        // Create a new User
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success=true;
        res.json({ success,authtoken });
    }
    // Catch errors
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured.");
    }
})

// Route 2: Authenticate a User using : POST "/api/auth/login". NO login required
router.post('/login', [
    body('email', "Enter a Valid Email.").isEmail(),
    body('password', "Password cannot be blank.").exists(),
], async (req, res) => {
    let success=false;
    // if there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success,error: "Please enter valid credentials." })
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success=false;
            return res.status(400).json({success, error: "Please enter valid credentials." })
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success=true;
        res.json({ success,authtoken });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured.");
    }

})

// Route 3: Get logged in User details : POST "/api/auth/getuser". login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured.");
    }
})


module.exports = router