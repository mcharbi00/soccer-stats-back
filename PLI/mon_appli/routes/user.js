var express = require('express');
var router = express.Router();
const User = require ("../models/User");

router.get('/', async(_, res) => {
    try {
        let users = await User.find();
        users = users.map((user) => {
            return {
                id: user.id,
                firstname: user.firstname,
                username: user.username,
                email: user.email,
            };
        });
        res.json(users); 
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/:id', async(req, res) => {
    const { id } = req.params;
    try {
        let user = await User.findById(id);

        if(!user) {
            res.status(404).json({message: "User not found."});
        }

        res.json({
            id: user.id,
            firstname: user.firstname,
            username: user.username,
            email: user.email,
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/register', async(req, res) => {
    const { firstname, username, email, password } = req.body;
    
    try {

        const newUser = new User({
            firstname: firstname,
            username: username,
            email: email,
            password: password,
        });

        await newUser.save();

        res.status(201).json({ message: "User created successfully."});

    } catch (err) {
        res.status(500).json(err);
    }
});

router.patch("/:id", async(req, res) => {
    const filter = {id: req.params.id};

    const updates = {
        firstname: req.body.firstname,
        username: req.body.username,
        email: req.body.email,
    };

    try {
        await User.findOneAndUpdate(filter, updates);
        const user = await User.findById(req.params.id);

        if(!user) {
            res.status(404).json({message: "User not found."});
        }

        res.status(200).json(user);
    
    } catch (err) {

    }
});

router.delete("/:id", async(req, res) => {
    const filter = {id: req.params.id};

    try {
        const user = await User.findById(req.params.id);
           if(!user) {
            res.status(404).json({message: "User not found."});
        }
        await User.findOneAndDelete(filter);
        
        res.status(200).json({message: "User deleted."});
    
    } catch (err) {
        res.status(500).json({ message: err});
    }
});

module.exports = router;