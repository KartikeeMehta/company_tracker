const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    companyId: { type: String },
    leadMember: { type: String},
    project: { type: String },
    // isDeleted: { type: Boolean, default: false },
    mustChangePassword: { type: Boolean, default: true },
    passwordExpiresAt: { type: Date, default: () => Date.now() + 5 * 60 * 1000  },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String }
}
);

module.exports = mongoose.model('TeamMember', teamMemberSchema);
