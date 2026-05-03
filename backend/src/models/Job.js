const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true, trim: true },
  companyLogo: { type: String, default: '' },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['internship', 'full-time', 'part-time', 'contract'], required: true },
  location: { type: String, required: true },
  isRemote: { type: Boolean, default: false },
  skillsRequired: [{ type: String, trim: true }],
  niceToHave: [{ type: String, trim: true }],
  minCgpa: { type: Number, default: 0 },
  experienceLevel: { type: String, enum: ['fresher', 'junior', '0-1', '1-3', '3-5', '5+'], default: 'fresher' },
  domain: { type: String, default: '' },
  stipend: { type: String, default: '' },
  salary: { type: String, default: '' },
  duration: { type: String, default: '' },
  openings: { type: Number, default: 1 },
  deadline: { type: Date },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }],
  applicationCount: { type: Number, default: 0 }
}, { timestamps: true });

JobSchema.index({ skillsRequired: 1, domain: 1, type: 1 });

module.exports = mongoose.model('Job', JobSchema);
