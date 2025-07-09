const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    companyName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
});

module.exports = mongoose.model('User', userSchema);