const User = require('../models/User');
const Student = require('../models/Student');
const Job = require('../models/Job');
const Application = require('../models/Application');

const getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalJobs, totalApplications] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Job.countDocuments({ isActive: true }),
      Application.countDocuments()
    ]);

    const placementStats = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const topSkills = await Student.aggregate([
      { $unwind: '$technicalSkills' },
      { $group: { _id: { $toLower: '$technicalSkills' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const topCompanies = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$company', jobs: { $sum: 1 }, applications: { $sum: '$applicationCount' } } },
      { $sort: { applications: -1 } },
      { $limit: 10 }
    ]);

    const jobsByType = await Job.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const jobsByDomain = await Job.aggregate([
      { $match: { domain: { $ne: '' } } },
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    const recentJobs = await Job.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('title company type createdAt');
    const recentApplications = await Application.find().sort({ appliedDate: -1 }).limit(5)
      .populate('studentId', 'name').populate('jobId', 'title company');

    const acceptedCount = placementStats.find(s => s._id === 'Accepted')?.count || 0;
    const placementRate = totalApplications > 0 ? Math.round((acceptedCount / totalApplications) * 100) : 0;

    res.json({
      overview: { totalUsers, totalStudents, totalJobs, totalApplications, placementRate },
      placementStats,
      topSkills: topSkills.map(s => ({ skill: s._id, count: s.count })),
      topCompanies,
      jobsByType,
      jobsByDomain,
      recentJobs,
      recentApplications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot deactivate admin' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin' });

    await User.findByIdAndDelete(req.params.id);
    await Student.findOneAndDelete({ userId: req.params.id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('recruiterId', 'name email').sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics, getAllUsers, toggleUserStatus, deleteUser, getAllJobs };
