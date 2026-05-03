const Student = require('../models/Student');
const User = require('../models/User');
const Application = require('../models/Application');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Fields a student may update via PUT /student/profile (prevents mass-assignment)
const ALLOWED_PROFILE_FIELDS = [
  'phone', 'college', 'degree', 'branch', 'graduationYear', 'cgpa',
  'technicalSkills', 'softSkills', 'certifications', 'projects', 'experience',
  'preferredDomains', 'careerInterests', 'locationPreference',
  'linkedIn', 'github', 'portfolio', 'bio', 'name'
];

const pickAllowed = (body, allowed) =>
  Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

const getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate('userId', 'name email avatar');
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    res.json({ student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = pickAllowed(req.body, ALLOWED_PROFILE_FIELDS);
    const student = await Student.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, upsert: true }
    ).populate('userId', 'name email avatar');

    await User.findByIdAndUpdate(req.user._id, { name: updates.name || req.user.name });

    res.json({ message: 'Profile updated successfully', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const resumePath = `/uploads/resumes/${req.file.filename}`;
    const student = await Student.findOneAndUpdate(
      { userId: req.user._id },
      { resume: resumePath },
      { new: true }
    );
    res.json({ message: 'Resume uploaded successfully', resume: resumePath, student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addSkill = async (req, res) => {
  try {
    const { skill, type } = req.body;
    const field = type === 'soft' ? 'softSkills' : 'technicalSkills';
    const student = await Student.findOneAndUpdate(
      { userId: req.user._id },
      { $addToSet: { [field]: skill } },
      { new: true }
    );
    res.json({ message: 'Skill added', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeSkill = async (req, res) => {
  try {
    const { skill, type } = req.body;
    const field = type === 'soft' ? 'softSkills' : 'technicalSkills';
    const student = await Student.findOneAndUpdate(
      { userId: req.user._id },
      { $pull: { [field]: skill } },
      { new: true }
    );
    res.json({ message: 'Skill removed', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.params.id }).populate('userId', 'name email');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    const applications = await Application.find({ studentId: req.user._id });
    const stats = {
      totalSkills: (student?.technicalSkills?.length || 0) + (student?.softSkills?.length || 0),
      totalApplications: applications.length,
      shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
      accepted: applications.filter(a => a.status === 'Accepted').length,
      rejected: applications.filter(a => a.status === 'Rejected').length,
      underReview: applications.filter(a => a.status === 'Under Review').length,
      cgpa: student?.cgpa || 0,
      profileComplete: calculateProfileCompletion(student)
    };
    res.json({ stats, student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const calculateProfileCompletion = (student) => {
  if (!student) return 0;
  const fields = [
    student.phone, student.college, student.degree, student.branch,
    student.cgpa, student.resume, student.bio,
    student.technicalSkills?.length > 0,
    student.projects?.length > 0,
    student.preferredDomains?.length > 0
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
};

const parseResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No PDF file provided' });
    if (!req.file.originalname.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ message: 'Only PDF files are supported for parsing' });
    }

    // Forward the uploaded file to the ML service
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: 'application/pdf',
    });

    const mlRes = await axios.post(
      `${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/parse-resume`,
      formData,
      { headers: formData.getHeaders(), timeout: 30000 }
    );

    const parsed = mlRes.data;

    // Return raw extracted data — saving is handled by the frontend after user review
    res.json({
      message: 'Resume parsed successfully',
      extracted: parsed,
    });
  } catch (error) {
    if (error.response) {
      return res.status(422).json({ message: error.response.data?.detail || 'ML parsing failed' });
    }
    res.status(500).json({ message: error.message });
  }
};

const bookmarkJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const isBookmarked = student.bookmarkedJobs.map(id => id.toString()).includes(jobId);
    const update = isBookmarked
      ? { $pull: { bookmarkedJobs: jobId } }
      : { $addToSet: { bookmarkedJobs: jobId } };

    await Student.findOneAndUpdate({ userId: req.user._id }, update);
    res.json({ bookmarked: !isBookmarked, jobId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate('bookmarkedJobs');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ bookmarks: student.bookmarkedJobs || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, uploadResume, addSkill, removeSkill, getStudentById, getDashboardStats, parseResume, bookmarkJob, getBookmarks };
