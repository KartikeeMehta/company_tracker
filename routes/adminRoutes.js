const express = require('express');
const TeamMember = require('../models/TeamMember');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');
const teamAuthMiddleware = require('../middleware/teamAuthMiddleware');
const router = express.Router();

router.post('/add-team-member', authMiddleware, async (req, res) => {
    if (req.user.role !== 'owner') return res.status(403).json({ message: 'Only owners can add team members' });

    const { name, email, companyId, leadMember, project } = req.body;

    if (!name || !email || !companyId || !leadMember) return res.status(400).json({ message: 'fields are required' });

    const existingMember = await TeamMember.findOne({ email });
    if (existingMember) return res.status(400).json({ message: 'Email already exists for a team member' });


    try {

        const autoPassword = crypto.randomBytes(6).toString('hex');
        console.log(autoPassword)
        const hashedPassword = await bcrypt.hash(autoPassword, 10);

        const expiresInMinutes = 1;
        const passwordExpiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

        const newMember = new TeamMember({
            name, email, companyId, leadMember, project, password: hashedPassword, passwordExpiresAt,
            addedBy: req.user._id
        });

        await newMember.save();


        await sendEmail(
            email,
            'Welcome to the Team',
            `Hi ${name},

            You've been added as a team member in ${req.user.companyName}.

            Login Email: ${email}  
            Password: ${autoPassword}

            Note: This is an auto-generated password and it will expire in 5 minutes. Please log in and update your password.`

        );



        res.status(201).json({ message: 'Team member added', member: newMember });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding team member' });
    }
});

router.post('/first-login', async (req, res) => {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    if (!email || !oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const member = await TeamMember.findOne({ email });
    if (!member)
        return res.status(404).json({ message: 'Team member not found' });

    if (member.passwordExpiresAt && new Date() > member.passwordExpiresAt) {
        return res.status(403).json({
            message: 'Your temporary password has expired. Please contact the administrator for a new one.'
        });
    }

    if (!member.mustChangePassword)
        return res.status(400).json({ message: 'Password already updated, use login instead' });

    const isMatch = await bcrypt.compare(oldPassword, member.password);
    if (!isMatch)
        return res.status(400).json({ message: 'Old password is incorrect' });

    if (newPassword !== confirmPassword)
        return res.status(400).json({ message: 'New passwords do not match' });

    const hashed = await bcrypt.hash(newPassword, 10);
    member.password = hashed;
    member.passwordExpiresAt = null;
    member.mustChangePassword = false;
    await member.save();

    res.status(200).json({ message: 'Password updated successfully. Please login.' });
});


router.post('/team-member-login', async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required' });

    if (confirmPassword !== undefined)
        return res.status(400).json({ message: 'Do not include confirmPassword during login' });

    const member = await TeamMember.findOne({ email });
    if (!member)
        return res.status(404).json({ message: 'Team member not found' });

    if (member.passwordExpiresAt && new Date() > member.passwordExpiresAt) {
        return res.status(403).json({
            message: 'Temporary password has expired. Please contact your administrator or request a new one.'
        });
    }

    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch)
        return res.status(400).json({ message: 'Incorrect password' });

    if (member.mustChangePassword)
        return res.status(400).json({ message: 'Please update your password first' });

    const token = jwt.sign({ id: member._id }, 'secret123', { expiresIn: '8h' });
    
            member.token = token;
            await member.save();

    res.status(200).json({
        message: 'Login successful', token,
        member: {
            name: member.name,
            email: member.email
        }
    });
});

router.post('/update-team-member', teamAuthMiddleware, async (req, res) => {
    const { companyId, leadMember, project } = req.body;

    const updated = await TeamMember.findByIdAndUpdate(
        req.member._id,
        { companyId, leadMember, project },
        { new: true }
    ).select('-password');

    res.json({ message: 'Updated', member: updated });
});



module.exports = router;