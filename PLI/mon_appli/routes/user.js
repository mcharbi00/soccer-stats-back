const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const crypto = require("crypto");

require('dotenv').config();
const auth = require('../middleware/auth');

router.get("/me", async (req, res) => {
    try {
        // Get the token from the headers
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).send("Unauthorized");
        }

        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send("Unauthorized");
            }
            // Find the user with the id in the decoded token
            User.findById(decoded.id, (err, user) => {
                if (err) {
                    return res.status(500).send("Internal server error");
                }
                if (!user) {
                    return res.status(404).send("User not found");
                }
                // Return the user data
                return res.json(user);
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/inscription", async (req, res) => {
    try {
        // Récupération des données de l'utilisateur
        const { lastname, firstname, email, password, profileImageUrl, dateOfBirth, role, club } = req.body;

        // Validation des champs
        if (!firstname || !email || !password) {
            return res.status(400).send(req.body, "Des champs obligatoires manquent");
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).send("Cet email est déjà utilisé");
        }

        // Hash le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Génération de la clé secrète
        const secret = crypto.randomBytes(16).toString("hex");

        // Création d'un nouvel utilisateur
        const newUser = new User({
            lastname,
            firstname,
            email,
            password: hashedPassword,
            secret,
            dateOfBirth,
            role,
            profileImageUrl,
            club
        });
        await newUser.save();

        // Envoi d'un message de succès
        res.send("Inscription réussie");
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});
router.get('/', async (_, res) => {
    try {
        let users = await User.find();
        users = users.map((user) => {
            return {
                id: user.id,
                username: user.username,
                firstname: user.firstname,
                email: user.email,
            };
        });
        res.json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        let user = await User.findById(id);

        if (!user) {
            res.status(404).json({ message: "User not found." })
        }

        res.json({
            id: user.id,
            username: user.username,
            firstname: user.firstname,
            email: user.email,
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

router.patch('/:id', async (req, res) => {
    const filter = { id: req.params.id };

    const updates = {
        username: req.body.username,
        firstname: req.body.firstname,
        email: req.body.email,
    };

    try {

        const user = await User.findById(filter);
        if (!user) {
            res.status(404).json({ message: "User not found." });
        }

        await User.findOneAndUpdate(filter, updates);


        res.status(200).json({ message: "User modified." });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate fields
        if (!email || !password) {
            return res.status(400).send("Missing required fields");
        }
        // Check if user with email exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send("Invalid email or password");
        }
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send("Invalid email or password");
        }
        // Create and assign JWT
        const token = jwt.sign({ id: user._id, role: user.role, secret: user.secret }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                firstname: user.firstname,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/validate", async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            id: user._id,
            username: user.username,
            firstname: user.firstname,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Unauthorized" });
    }
});


module.exports = router;
