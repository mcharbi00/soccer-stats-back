const express = require('express');
const bcrypt = require("bcrypt");
const User = require('../models/user');

const router = express.Router();

// route for user registration
router.post("/inscription", async (req, res) => {
    try {
        const { username, firstname, email, password } = req.body;

        // validate user input
        if (!username || !firstname || !email || !password) {
            return res.status(400).send("missing required fields");
        }

        // check if user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(409).send("user already exists");
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create new user
        const newUser = new User({
            username,
            firstname,
            email,
            password: hashedPassword
        });

        // save new user to the database
        await newUser.save();

        res.send("user registration successfull");
    } catch (err) {
        res.status(500).send(err);
    }
});

// route for user login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // validate user input
        if (!email || !password) {
            return res.status(400).send("missing required fields");
        }

        // check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send("user not found");
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send("invalid email or password");
        }

        // set user session
        req.session.user = user;
        res.redirect('/secure');

    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;
