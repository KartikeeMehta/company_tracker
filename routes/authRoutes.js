const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/register', async (req,res)=>{

    const { companyName, email, phoneNumber,password,confirmPassword} = req.body;
    
    if(!companyName || !email || !phoneNumber || !password || !confirmPassword)
        return res.status(400).json ({message : 'Required fields missing'});

    if( password !==confirmPassword)
        return res.status(400).json({message : 'password not match '})

    const existing = await User.findOne({companyName})
    if(existing) return res.status(400).json({message: 'Company already registerd'})

    const hashed = await bcrypt.hash(password, 10);


    const newUser = new User({ companyName, email, phoneNumber, password: hashed });
    await newUser.save();










})









module.exports = router;

