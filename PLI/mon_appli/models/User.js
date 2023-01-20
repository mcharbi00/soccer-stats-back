const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = mongoose.Schema({
    lastname: {
        type: String,
        required: true,
        unique: false

    },
    firstname: {
        type: String,
        required: true,
        unique: false
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, 'Invalid email']
    },
    dateOfBirth: {
        type: Date,
        required: false,
    },
    password: {
        type: String,
        required: true,

    },
    role: {
        type: String,
        required: false,
        unique: false
    },
    club: {
        type: String,
        required: false,
        unique: false
    },
    profileImageUrl: {
        type: String,
        required: false,
        unique: false
    }
});

module.exports = mongoose.model("User", userSchema);
