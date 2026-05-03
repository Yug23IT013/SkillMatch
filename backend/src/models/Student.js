const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  phone: { type: String, default: '' },
  college: { type: String, default: '' },
  degree: { type: String, default: '' },
  branch: { type: String, default: '' },
  graduationYear: { type: Number },
  cgpa: { type: Number, min: 0, max: 10, default: 0 },
  technicalSkills: [{ type: String, trim: true }],
  softSkills: [{ type: String, trim: true }],
  certifications: [{
    name: { type: String },
    issuer: { type: String },
    year: { type: Number }
  }],
  projects: [{
    title: { type: String },
    description: { type: String },
    techStack: [{ type: String }],
    link: { type: String }
  }],
  experience: [{
    title: { type: String },
    company: { type: String },
    duration: { type: String },
    description: { type: String }
  }],
  preferredDomains: [{ type: String }],
  careerInterests: [{ type: String }],
  locationPreference: [{ type: String }],
  resume: { type: String, default: '' },
  linkedIn: { type: String, default: '' },
  github: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  bio: { type: String, default: '' },
  skillVector: { type: [Number], default: [] },
  bookmarkedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
