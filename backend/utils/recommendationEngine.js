import StudentProfile from "../models/StudentProfile.js";
import Internship from "../models/Internship.js";
import Application from "../models/Application.js";

/**
 * Calculate match score between student skills and internship required skills.
 * matchScore = (matching skills / total required skills) * 100
 * Bonus points for interest matches.
 */
const calculateMatchScore = (studentSkills, studentInterests, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) return 100;

  const normalizedStudentSkills = studentSkills.map((s) => s.toLowerCase().trim());
  const normalizedInterests = studentInterests.map((i) => i.toLowerCase().trim());
  const normalizedRequired = requiredSkills.map((s) => s.toLowerCase().trim());

  const matchingSkills = normalizedRequired.filter((skill) => normalizedStudentSkills.includes(skill));

  let score = (matchingSkills.length / normalizedRequired.length) * 100;

  // Soft bonus: +5 per interest overlap (max +20)
  const interestOverlap = normalizedRequired.filter((skill) => normalizedInterests.includes(skill));
  score += Math.min(interestOverlap.length * 5, 20);

  return Math.min(Math.round(score * 100) / 100, 100);
};

/**
 * Get sorted internship recommendations for a student.
 * Filters out: already applied, CGPA-ineligible, expired deadlines.
 */
export const getRecommendations = async (studentUserId) => {
  const profile = await StudentProfile.findOne({ user: studentUserId });

  if (!profile) {
    throw new Error("Student profile not found");
  }

  const { skills = [], interests = [], cgpa = 0 } = profile;

  // Get already applied internship IDs to exclude
  const applications = await Application.find({ student: studentUserId }).select("internship");
  const appliedIds = new Set(applications.map((a) => a.internship.toString()));

  const now = new Date();

  const internships = await Internship.find({
    isActive: true,
    deadline: { $gte: now },
    minCGPA: { $lte: cgpa },
  }).populate("postedBy", "name email");

  const scored = internships
    .filter((i) => !appliedIds.has(i._id.toString()))
    .map((internship) => {
      const matchScore = calculateMatchScore(skills, interests, internship.requiredSkills);
      return {
        ...internship.toObject(),
        matchScore,
        matchedSkills: internship.requiredSkills.filter((s) =>
          skills.map((sk) => sk.toLowerCase()).includes(s.toLowerCase())
        ),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return scored;
};
