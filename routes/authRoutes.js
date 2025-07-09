const express = require('express');
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
const User = require('../models/User');
// const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/register', async (req, res) => {

    try {

        const { companyName, companyDomain, firstName, lastName, email, password, confirmPassword } = req.body;

        if (!companyName || !email || !companyDomain || !firstName || !lastName || !password || !confirmPassword)
            return res.status(400).json({ message: 'Required fields missing' });

        if (password !== confirmPassword)
            return res.status(400).json({ message: 'password do not match ' });

        const existingEmail = await User.findOne({ email });
        if (existingEmail)
            return res.status(400).json({ message: 'Email already registered' });

        const existingCompany = await User.findOne({ companyName });
        if (existingCompany)
            return res.status(400).json({ message: 'Company already registered' });

        const hashed = await bcrypt.hash(password, 10);


        const newUser = new User({ companyName, companyDomain, firstName, lastName, email, password: hashed });
        await newUser.save();

        res.status(201).json({ message: 'Registered as owner' });
    } catch (err) {
        // console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/login', async (req,res)=>{

    try{

    const {email, password} = req.body;

    if(!email || !password)
        return res.status(400).json({message: 'Required fields missing'});
     
    const user = await User.findOne({email})
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Wrong password' });


      res.json({ message: 'Login successful' });
} catch (err) {
        // console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error' });
    }


});








module.exports = router;

