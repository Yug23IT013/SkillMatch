const axios = require('axios');
const Student = require('../models/Student');
const Job = require('../models/Job');
const Application = require('../models/Application');

const SKILL_LIST = [
  'python', 'javascript', 'java', 'c++', 'c#', 'react', 'node.js', 'express', 'mongodb',
  'sql', 'postgresql', 'mysql', 'machine learning', 'deep learning', 'data science', 'nlp',
  'computer vision', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'html', 'css',
  'tailwind', 'typescript', 'next.js', 'vue.js', 'angular', 'django', 'flask', 'fastapi',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'linux', 'rest api', 'graphql',
  'data structures', 'algorithms', 'system design', 'microservices', 'ci/cd', 'testing',
  'communication', 'teamwork', 'leadership', 'problem solving', 'time management'
];

const buildSkillVector = (skills) => {
  const lowerSkills = skills.map(s => s.toLowerCase());
  return SKILL_LIST.map(s => lowerSkills.includes(s) ? 1 : 0);
};

const cosineSimilarity = (vecA, vecB) => {
  if (!vecA.length || !vecB.length) return 0;
  const dot = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
};

const computeMatchScore = (student, job) => {
  const studentSkills = [...(student.technicalSkills || []), ...(student.softSkills || [])];
  const studentVec = buildSkillVector(studentSkills);
  const jobVec = buildSkillVector(job.skillsRequired || []);

  const skillScore = cosineSimilarity(studentVec, jobVec) * 60;

  const matchedSkills = (job.skillsRequired || []).filter(s =>
    studentSkills.map(sk => sk.toLowerCase()).includes(s.toLowerCase())
  );
  const missingSkills = (job.skillsRequired || []).filter(s =>
    !studentSkills.map(sk => sk.toLowerCase()).includes(s.toLowerCase())
  );

  let cgpaScore = 0;
  if (student.cgpa && job.minCgpa) {
    if (student.cgpa >= job.minCgpa) cgpaScore = 15;
    else cgpaScore = Math.max(0, 15 - (job.minCgpa - student.cgpa) * 5);
  } else {
    cgpaScore = 10;
  }

  const domainMatch = (student.preferredDomains || []).some(d =>
    job.domain?.toLowerCase().includes(d.toLowerCase()) ||
    d.toLowerCase().includes(job.domain?.toLowerCase() || '')
  ) ? 15 : 5;

  const locationMatch = (student.locationPreference || []).some(l =>
    job.location?.toLowerCase().includes(l.toLowerCase()) ||
    job.isRemote
  ) ? 10 : 5;

  const totalScore = Math.min(100, Math.round(skillScore + cgpaScore + domainMatch + locationMatch));

  return { score: totalScore, matchedSkills, missingSkills };
};

const getRecommendations = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user._id;
    const student = await Student.findOne({ userId: studentId });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const appliedJobIds = (await Application.find({ studentId })).map(a => a.jobId.toString());
    const jobs = await Job.find({ isActive: true, _id: { $nin: appliedJobIds } });

    const internships = [];
    const placements = [];

    for (const job of jobs) {
      const { score, matchedSkills, missingSkills } = computeMatchScore(student, job);
      const result = {
        job,
        matchScore: score,
        matchedSkills,
        missingSkills,
        reasons: matchedSkills.slice(0, 5),
        explanation: generateExplanation(score, matchedSkills, missingSkills, student, job)
      };

      if (job.type === 'internship') internships.push(result);
      else placements.push(result);
    }

    internships.sort((a, b) => b.matchScore - a.matchScore);
    placements.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      internships: internships.slice(0, 10),
      placements: placements.slice(0, 10),
      totalMatched: internships.length + placements.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMLRecommendations = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    const jobs = await Job.find({ isActive: true });

    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/recommend`, {
        student_profile: {
          skills: [...(student.technicalSkills || []), ...(student.softSkills || [])],
          cgpa: student.cgpa || 0,
          preferred_domains: student.preferredDomains || [],
          location_preference: student.locationPreference || []
        },
        jobs: jobs.map(j => ({
          id: j._id,
          title: j.title,
          company: j.company,
          skills_required: j.skillsRequired,
          min_cgpa: j.minCgpa,
          domain: j.domain,
          location: j.location,
          type: j.type
        }))
      });
      return res.json(mlResponse.data);
    } catch (mlError) {
      return getRecommendations(req, res);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateExplanation = (score, matched, missing, student, job) => {
  const lines = [];
  if (score >= 80) lines.push('Excellent match for your profile');
  else if (score >= 60) lines.push('Good match for your profile');
  else lines.push('Partial match - consider upskilling');

  if (matched.length > 0) lines.push(`You have ${matched.length} of ${(job.skillsRequired || []).length} required skills`);
  if (missing.length > 0) lines.push(`${missing.length} skills to acquire: ${missing.slice(0, 3).join(', ')}`);
  if (student.cgpa >= (job.minCgpa || 0)) lines.push(`CGPA ${student.cgpa} meets the requirement`);

  return lines.join('. ');
};

const getMissingSkillSuggestions = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const jobs = await Job.find({ isActive: true });
    const skillFrequency = {};

    jobs.forEach(job => {
      (job.skillsRequired || []).forEach(skill => {
        const s = skill.toLowerCase();
        const studentHas = [...(student.technicalSkills || []), ...(student.softSkills || [])]
          .map(sk => sk.toLowerCase()).includes(s);
        if (!studentHas) {
          skillFrequency[s] = (skillFrequency[s] || 0) + 1;
        }
      });
    });

    const suggestions = Object.entries(skillFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, demandCount: count, priority: count > 5 ? 'High' : count > 2 ? 'Medium' : 'Low' }));

    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMostDemandedSkills = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true });
    const skillFrequency = {};
    let totalJobs = jobs.length || 1;

    jobs.forEach(job => {
      (job.skillsRequired || []).forEach(skill => {
        const s = skill.toLowerCase();
        skillFrequency[s] = (skillFrequency[s] || 0) + 1;
      });
    });

    const demandedSkills = Object.entries(skillFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([skill, count]) => ({
        skill,
        count,
        demandPercent: Math.round((count / totalJobs) * 100),
        category: count >= 6 ? 'Hot' : count >= 3 ? 'Rising' : 'Emerging'
      }));

    res.json({ demandedSkills, totalJobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResumeRecommendations = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found. Please complete your profile.' });

    // Collect all skills from resume: profile skills + project tech stacks
    const resumeSkills = [
      ...(student.technicalSkills || []),
      ...(student.softSkills || []),
      ...(student.projects || []).flatMap(p => p.techStack || [])
    ];

    const uniqueResumeSkills = [...new Set(resumeSkills.map(s => s.toLowerCase()))];

    if (uniqueResumeSkills.length === 0) {
      return res.json({
        internships: [],
        placements: [],
        resumeSkills: [],
        message: 'Add skills to your profile to get resume-based recommendations'
      });
    }

    const appliedJobIds = (await Application.find({ studentId: req.user._id })).map(a => a.jobId.toString());
    const jobs = await Job.find({ isActive: true, _id: { $nin: appliedJobIds } });

    const internships = [];
    const placements = [];

    for (const job of jobs) {
      const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase());
      const matched = jobSkills.filter(s => uniqueResumeSkills.includes(s));
      const missing = jobSkills.filter(s => !uniqueResumeSkills.includes(s));

      // Only include jobs where at least 1 skill matches
      if (matched.length === 0) continue;

      const { score, matchedSkills, missingSkills } = computeMatchScore(student, job);
      const result = {
        job,
        matchScore: score,
        matchedSkills,
        missingSkills,
        resumeMatchCount: matched.length,
        totalRequired: jobSkills.length,
        explanation: generateExplanation(score, matchedSkills, missingSkills, student, job)
      };

      if (job.type === 'internship') internships.push(result);
      else placements.push(result);
    }

    internships.sort((a, b) => b.resumeMatchCount - a.resumeMatchCount || b.matchScore - a.matchScore);
    placements.sort((a, b) => b.resumeMatchCount - a.resumeMatchCount || b.matchScore - a.matchScore);

    res.json({
      internships: internships.slice(0, 10),
      placements: placements.slice(0, 10),
      resumeSkills: uniqueResumeSkills,
      totalMatched: internships.length + placements.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRecommendations, getMLRecommendations, getMissingSkillSuggestions, getMostDemandedSkills, getResumeRecommendations };
