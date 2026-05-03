const Job = require('../models/Job');
const Application = require('../models/Application');
const Student = require('../models/Student');

// Escape regex metacharacters to prevent ReDoS from query params
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Fields a recruiter is allowed to set / update on a job posting
const ALLOWED_JOB_FIELDS = [
  'title', 'company', 'description', 'type', 'location', 'isRemote',
  'skillsRequired', 'niceToHave', 'minCgpa', 'experienceLevel', 'domain',
  'stipend', 'salary', 'duration', 'openings', 'deadline', 'isActive', 'tags'
];

const pickAllowed = (body, allowed) =>
  Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

const getJobs = async (req, res) => {
  try {
    const { type, domain, location, search, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    if (type)     query.type = type;
    if (domain)   query.domain    = { $regex: escapeRegex(domain),   $options: 'i' };
    if (location) query.location  = { $regex: escapeRegex(location), $options: 'i' };
    if (search) {
      const s = escapeRegex(search);
      query.$or = [
        { title:          { $regex: s, $options: 'i' } },
        { company:        { $regex: s, $options: 'i' } },
        { skillsRequired: { $in: [new RegExp(s, 'i')] } }
      ];
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('recruiterId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ jobs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiterId', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createJob = async (req, res) => {
  try {
    const jobData = { ...pickAllowed(req.body, ALLOWED_JOB_FIELDS), recruiterId: req.user._id };
    const job = await Job.create(jobData);
    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiterId: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });

    const updates = pickAllowed(req.body, ALLOWED_JOB_FIELDS);
    const updated = await Job.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ message: 'Job updated', job: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiterId: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });

    await Job.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Job deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });

    // Get real-time application counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ jobId: job._id });
        return { ...job.toObject(), applicationCount: count };
      })
    );

    res.json({ jobs: jobsWithCounts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiterId: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });

    // Single populate — studentId references User model (name + email)
    const applications = await Application.find({ jobId: req.params.id })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    // Enrich each application with the student's academic profile
    const enriched = await Promise.all(
      applications.map(async (app) => {
        const appObj = app.toObject();
        if (app.studentId?._id) {
          const profile = await Student.findOne({ userId: app.studentId._id })
            .select('cgpa technicalSkills college degree branch resume');
          appObj.studentProfile = profile || null;
        }
        return appObj;
      })
    );

    res.json({ applications: enriched, job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob, getRecruiterJobs, getJobApplicants };
