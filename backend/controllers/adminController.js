import User from "../models/User.js";
import Internship from "../models/Internship.js";
import Application from "../models/Application.js";

// @desc  Get platform stats
// @route GET /api/admin/stats
// @access Private (admin)
export const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStudents, totalRecruiters, totalInternships, totalApplications, recentUsers] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "recruiter" }),
        Internship.countDocuments(),
        Application.countDocuments(),
        User.find().sort("-createdAt").limit(5).select("name email role createdAt"),
      ]);

    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusMap = applicationsByStatus.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalRecruiters,
        totalInternships,
        totalApplications,
        applicationsByStatus: statusMap,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all users
// @route GET /api/admin/users
// @access Private (admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};

    const users = await User.find(filter)
      .select("-password")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.json({ success: true, total, page: Number(page), data: users });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete user (admin action)
// @route DELETE /api/admin/users/:id
// @access Private (admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Cannot delete an admin account" });
    }

    await user.deleteOne();
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
