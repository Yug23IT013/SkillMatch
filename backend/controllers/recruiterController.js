import Internship from "../models/Internship.js";
import Application from "../models/Application.js";
import StudentProfile from "../models/StudentProfile.js";

// @desc  Post a new internship
// @route POST /api/internship
// @access Private (recruiter)
export const createInternship = async (req, res, next) => {
  try {
    const { title, company, description, requiredSkills, minCGPA, location, stipend, duration, deadline } = req.body;

    if (!title || !company || !deadline) {
      return res.status(400).json({ success: false, message: "Title, company, and deadline are required" });
    }

    const skills = Array.isArray(requiredSkills)
      ? requiredSkills
      : typeof requiredSkills === "string"
      ? requiredSkills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const internship = await Internship.create({
      title,
      company,
      description,
      requiredSkills: skills,
      minCGPA: Number(minCGPA) || 0,
      location,
      stipend: Number(stipend) || 0,
      duration,
      deadline: new Date(deadline),
      postedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: internship });
  } catch (error) {
    next(error);
  }
};

// @desc  Get recruiter's internships
// @route GET /api/internship
// @access Private (recruiter)
export const getMyInternships = async (req, res, next) => {
  try {
    const internships = await Internship.find({ postedBy: req.user._id }).sort("-createdAt");
    res.json({ success: true, count: internships.length, data: internships });
  } catch (error) {
    next(error);
  }
};

// @desc  Update internship
// @route PUT /api/internship/:id
// @access Private (recruiter)
export const updateInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findOne({ _id: req.params.id, postedBy: req.user._id });

    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found or not authorized" });
    }

    if (req.body.requiredSkills && typeof req.body.requiredSkills === "string") {
      req.body.requiredSkills = req.body.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    const updated = await Internship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc  Delete internship
// @route DELETE /api/internship/:id
// @access Private (recruiter)
export const deleteInternship = async (req, res, next) => {
  try {
    const internship = await Internship.findOne({ _id: req.params.id, postedBy: req.user._id });

    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found or not authorized" });
    }

    await internship.deleteOne();
    await Application.deleteMany({ internship: req.params.id });

    res.json({ success: true, message: "Internship deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc  Get applicants for an internship
// @route GET /api/internship/applicants/:id
// @access Private (recruiter)
export const getApplicants = async (req, res, next) => {
  try {
    const internship = await Internship.findOne({ _id: req.params.id, postedBy: req.user._id });

    if (!internship) {
      return res.status(404).json({ success: false, message: "Internship not found or not authorized" });
    }

    const applications = await Application.find({ internship: req.params.id })
      .populate("student", "name email")
      .sort("-appliedAt");

    // Attach student profile to each application
    const enriched = await Promise.all(
      applications.map(async (app) => {
        const profile = await StudentProfile.findOne({ user: app.student._id });
        return { ...app.toObject(), profile };
      })
    );

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc  Update application status
// @route PUT /api/internship/applicants/:applicationId/status
// @access Private (recruiter)
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["applied", "shortlisted", "rejected", "selected"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const application = await Application.findById(req.params.applicationId).populate("internship");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Verify recruiter owns the internship
    if (application.internship.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    application.status = status;
    await application.save();

    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};
