// jobs/cleanupJob.js
const TeamMember = require('../models/TeamMember');

const cleanupExpiredTeamMembers = async () => {
    try {
        const now = new Date();
        const membersToDelete = await TeamMember.find({
            mustChangePassword: true,
            passwordExpiresAt: { $lt: now }
        });
        console.log("delete:", membersToDelete);

        const result = await TeamMember.deleteMany({
            mustChangePassword: true,
            passwordExpiresAt: { $lt: now }
        });

        if (result.deletedCount > 0) {
            console.log(` Deleted ${result.deletedCount} expired team members`);
        }
    } catch (err) {
        console.error(' Error cleaning up expired team members:', err);
    }
};

module.exports = cleanupExpiredTeamMembers;
