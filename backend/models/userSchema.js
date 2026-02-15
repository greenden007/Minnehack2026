const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    username: { type: String, required: true },
    firstName: { type: String, required: false, default: "User" },
    lastName: { type: String, required: false, default: "" },
    email: { type: String, required: true },
    password: { type: String, required: true },
    emergencyContactNums: { type: [String], required: true, default: [] }
});

module.exports = model('User', userSchema);
