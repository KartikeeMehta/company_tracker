const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');
const router = express.Router();
const TeamMember = require('../models/TeamMember');



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


        await sendEmail(
            email,
            '🎉 Registration Successful - Welcome Aboard!',
            `Hello ${companyName},

            Thank you for registering on our platform.

            You are now registered as an "Owner". You can log in and start managing your team.

            Regards,
            TeamTrak`
        );


        res.status(201).json({ message: 'Registered as owner' });
    } catch (err) {
        // console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// router.post('/login', async (req, res) => {
    

//     try {

//         const { email, password } = req.body;

//         if (!email || !password)
//             return res.status(400).json({ message: 'Required fields missing' });

//         const user = await User.findOne({ email })
//         if (!user) return res.status(404).json({ message: 'User not found' });

//         const isMatch = await bcrypt.compare(password, user.password)
//         if (!isMatch) return res.status(400).json({ message: 'Wrong password' });

//         const token = jwt.sign({ id: user._id }, 'secret123', { expiresIn: '8h' });

//         user.token = token;
//         await user.save();


//         res.json({ message: 'Login successful', token });
//     } catch (err) {
//         // console.error('Registration error:', err);
//         res.status(500).json({ message: 'Server error' });
//     }
// });



router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: 'Required fields missing' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Wrong password' });

        let token = user.token;

        
        let isTokenValid = false;
        if (token) {
            try {
                jwt.verify(token, 'secret123');
                isTokenValid = true;
            } catch (err) {
                isTokenValid = false;
            }
        }

        
        if (!isTokenValid) {
            token = jwt.sign({ id: user._id }, 'secret123', { expiresIn: '8h' });
            user.token = token;
            await user.save();
        }

        res.json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});



router.post('/update', authMiddleware, async (req, res) => {
    const { companyName, companyDomain, email } = req.body;

    const updated = await User.findByIdAndUpdate(
        req.user._id,
        { companyName, companyDomain, email },
        { new: true }
    ).select('-password');

    res.json({ message: 'Updated', user: updated });
});


// DELETE /team-member/:email

router.delete('/team-member/:email', authMiddleware, async (req, res) => {
    try {
        const { email } = req.params;
        const ownerId = req.user.id;

        const deleted = await TeamMember.findOneAndDelete({
            email,
            addedBy: ownerId
        });


        if (!deleted) {
            return res.status(404).json({ message: 'Team member not found or already deleted.' });
        }

        res.status(200).json({ message: 'Team member deleted successfully.' });
    } catch (error) {
        console.error('Soft delete error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});




module.exports = router;

