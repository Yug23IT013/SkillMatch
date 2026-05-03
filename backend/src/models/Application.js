const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Accepted'],
    default: 'Applied'
  },
  coverLetter: { type: String, default: '' },
  matchScore: { type: Number, default: 0 },
  statusHistory: [{
    status: { type: String },
    updatedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' }
  }],
  recruiterNote: { type: String, default: '' },
  appliedDate: { type: Date, default: Date.now }
}, { timestamps: true });

ApplicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
