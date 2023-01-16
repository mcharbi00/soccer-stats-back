const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, 'Invalid email']
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("User", userSchema);
