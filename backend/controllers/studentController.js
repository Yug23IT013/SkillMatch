import StudentProfile from "../models/StudentProfile.js";
import Application from "../models/Application.js";
import Internship from "../models/Internship.js";
import { getRecommendations } from "../utils/recommendationEngine.js";

// @desc  Get student profile
// @route GET /api/student/profile
// @access Private (student)
export const getProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id }).populate("user", "name email");

    if (!profile) {
      profile = await StudentProfile.create({ user: req.user._id });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// @desc  Update student profile
// @route PUT /api/student/profile
// @access Private (student)
export const updateProfile = async (req, res, next) => {
  try {
    const { branch, cgpa, skills, interests, resumeURL } = req.body;

    const updates = {};
    if (branch !== undefined) updates.branch = branch;
    if (cgpa !== undefined) updates.cgpa = Number(cgpa);
    if (skills !== undefined) updates.skills = Array.isArray(skills) ? skills : skills.split(",").map((s) => s.trim());
    if (interests !== undefined)
      updates.interests = Array.isArray(interests) ? interests : interests.split(",").map((s) => s.trim());
    if (resumeURL !== undefined) updates.resumeURL = resumeURL;

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    ).populate("user", "name email");

    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// @desc  Get recommended internships
// @route GET /api/student/recommendations
// @access Private (student)
export const getRecommendedInternships = async (req, res, next) => {
  try {
    const recommendations = await getRecommendations(req.user._id);
    res.json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error) {
    next(error);
  }
};

// @desc  Apply for an internship
// @route POST /api/student/apply/:internshipId
// @access Private (student)
export const applyForInternship = async (req, res, next) => {
  try {
    const { internshipId } = req.params;
    const { coverLetter } = req.body;

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found" });
    }

    if (!internship.isActive || new Date(internship.deadline) < new Date()) {
      return res.status(400).json({ success: false, message: "Application deadline has passed" });
    }

    const existing = await Application.findOne({ student: req.user._id, internship: internshipId });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already applied for this internship" });
    }

    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (profile && profile.cgpa < internship.minCGPA) {
      return res.status(400).json({
        success: false,
        message: `Minimum CGPA requirement is ${internship.minCGPA}`,
      });
    }

    const application = await Application.create({
      student: req.user._id,
      internship: internshipId,
      coverLetter: coverLetter || "",
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

// @desc  Get student's applications
// @route GET /api/student/applications
// @access Private (student)
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate("internship", "title company location stipend duration deadline status")
      .sort("-appliedAt");

    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    next(error);
  }
};
