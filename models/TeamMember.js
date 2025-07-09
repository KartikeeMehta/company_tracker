const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leadMember: { type: Boolean, default: false },
    project: { type: String }, 
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}
);

module.exports = mongoose.model('TeamMember', teamMemberSchema);
