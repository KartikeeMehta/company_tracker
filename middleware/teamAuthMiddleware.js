const jwt = require('jsonwebtoken');
const TeamMember = require('../models/TeamMember');

const teamAuthMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const decoded = jwt.verify(token, 'secret123'); // You should use process.env.JWT_SECRET
        const member = await TeamMember.findById(decoded.id).select('-password');

        if (!member) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        req.member = member;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = teamAuthMiddleware;
