const Application = require('../models/Application');
const Job = require('../models/Job');
const Student = require('../models/Student');
const User = require('../models/User');
const { sendApplicationStatusEmail } = require('../utils/emailService');

const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, matchScore } = req.body;
    const job = await Job.findById(jobId);
    if (!job || !job.isActive) return res.status(404).json({ message: 'Job not found or inactive' });

    const existing = await Application.findOne({ studentId: req.user._id, jobId });
    if (existing) return res.status(400).json({ message: 'Already applied for this job' });

    const application = await Application.create({
      studentId: req.user._id,
      jobId,
      coverLetter,
      matchScore: matchScore || 0,
      statusHistory: [{ status: 'Applied', updatedAt: new Date() }]
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate('jobId', 'title company type location stipend salary domain')
      .sort({ appliedDate: -1 });
    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('studentId', 'name email');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json({ application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('studentId', 'name email');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const job = await Job.findOne({ _id: application.jobId._id, recruiterId: req.user._id });
    if (!job) return res.status(403).json({ message: 'Not authorized to update this application' });

    application.status = status;
    application.recruiterNote = note || application.recruiterNote;
    application.statusHistory.push({ status, updatedAt: new Date(), note: note || '' });
    await application.save();

    // Send email notification to student
    try {
      await sendApplicationStatusEmail(
        application.studentId.email,
        application.studentId.name,
        application.jobId.title,
        application.jobId.company,
        status,
        note
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ message: 'Application status updated', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, studentId: req.user._id });
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.status !== 'Applied') {
      return res.status(400).json({ message: 'Cannot withdraw application at this stage' });
    }
    await Application.findByIdAndDelete(req.params.id);
    await Job.findByIdAndUpdate(application.jobId, { $inc: { applicationCount: -1 } });
    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { applyForJob, getMyApplications, getApplicationById, updateApplicationStatus, withdrawApplication };
