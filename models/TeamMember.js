const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    companyId: { String },
    leadMember: { type: String},
    project: { type: String },
    mustChangePassword: { type: Boolean, default: true },
    passwordExpiresAt: { type: Date, default: () => Date.now() + 5 * 60 * 1000  },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}
);

module.exports = mongoose.model('TeamMember', teamMemberSchema);
