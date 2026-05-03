const { body, query, param, validationResult } = require('express-validator');

// ─── Helper: run collected validations and return 422 on first failure ────────
const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Reusable field helpers ───────────────────────────────────────────────────
const mongoId = (field, location = param) =>
  location(field).isMongoId().withMessage(`${field} must be a valid ID`);

const trimmedString = (field, min, max) =>
  body(field)
    .trim()
    .escape()
    .isLength({ min, max })
    .withMessage(`${field} must be between ${min} and ${max} characters`);

// ─── Auth ─────────────────────────────────────────────────────────────────────
const registerRules = [
  body('name')
    .trim()
    .escape()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),

  body('email')
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('A valid email address is required')
    .isLength({ max: 254 }).withMessage('Email too long'),

  body('password')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8–128 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),

  body('role')
    .optional()
    .isIn(['student', 'recruiter']).withMessage('Role must be student or recruiter'),
];

const loginRules = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('A valid email address is required'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ max: 128 }).withMessage('Password too long'),
];

const changePasswordRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required')
    .isLength({ max: 128 }).withMessage('Password too long'),

  body('newPassword')
    .isLength({ min: 8, max: 128 }).withMessage('New password must be 8–128 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain at least one letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),
];

// ─── Student Profile ──────────────────────────────────────────────────────────
const updateProfileRules = [
  body('name').optional().trim().escape()
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),

  body('phone').optional().trim()
    .matches(/^[\d\s\+\-\(\)]{7,20}$/).withMessage('Invalid phone number format'),

  body('college').optional().trim().escape()
    .isLength({ max: 120 }).withMessage('College name too long'),

  body('degree').optional().trim().escape()
    .isLength({ max: 60 }).withMessage('Degree too long'),

  body('branch').optional().trim().escape()
    .isLength({ max: 80 }).withMessage('Branch too long'),

  body('graduationYear').optional()
    .isInt({ min: 2000, max: 2035 }).withMessage('Graduation year must be between 2000 and 2035'),

  body('cgpa').optional()
    .isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),

  body('bio').optional().trim().escape()
    .isLength({ max: 1000 }).withMessage('Bio must be 1000 characters or fewer'),

  body('linkedIn').optional().trim()
    .isURL({ protocols: ['https'], require_protocol: true }).withMessage('LinkedIn must be a valid HTTPS URL')
    .isLength({ max: 200 }).withMessage('URL too long'),

  body('github').optional().trim()
    .isURL({ protocols: ['https'], require_protocol: true }).withMessage('GitHub must be a valid HTTPS URL')
    .isLength({ max: 200 }).withMessage('URL too long'),

  body('portfolio').optional().trim()
    .isURL({ protocols: ['https', 'http'], require_protocol: true }).withMessage('Portfolio must be a valid URL')
    .isLength({ max: 200 }).withMessage('URL too long'),

  body('technicalSkills').optional()
    .isArray({ max: 50 }).withMessage('Technical skills can have at most 50 entries'),

  body('technicalSkills.*').optional().trim().escape()
    .isLength({ min: 1, max: 60 }).withMessage('Each skill must be 1–60 characters'),

  body('softSkills').optional()
    .isArray({ max: 30 }).withMessage('Soft skills can have at most 30 entries'),

  body('softSkills.*').optional().trim().escape()
    .isLength({ min: 1, max: 60 }).withMessage('Each skill must be 1–60 characters'),

  body('preferredDomains').optional()
    .isArray({ max: 10 }).withMessage('Too many preferred domains'),

  body('preferredDomains.*').optional().trim().escape()
    .isLength({ max: 60 }).withMessage('Domain name too long'),

  body('locationPreference').optional()
    .isArray({ max: 10 }).withMessage('Too many location preferences'),

  body('locationPreference.*').optional().trim().escape()
    .isLength({ max: 80 }).withMessage('Location name too long'),

  body('projects').optional()
    .isArray({ max: 20 }).withMessage('Too many projects'),

  body('projects.*.title').optional().trim().escape()
    .isLength({ max: 120 }).withMessage('Project title too long'),

  body('projects.*.description').optional().trim().escape()
    .isLength({ max: 1000 }).withMessage('Project description must be 1000 characters or fewer'),

  body('projects.*.link').optional().trim()
    .isURL({ require_protocol: false }).withMessage('Project link must be a valid URL')
    .isLength({ max: 200 }).withMessage('Project URL too long'),

  body('certifications').optional()
    .isArray({ max: 20 }).withMessage('Too many certifications'),

  body('certifications.*.name').optional().trim().escape()
    .isLength({ max: 120 }).withMessage('Certification name too long'),

  body('certifications.*.issuer').optional().trim().escape()
    .isLength({ max: 120 }).withMessage('Issuer name too long'),

  body('certifications.*.year').optional()
    .isInt({ min: 1990, max: 2035 }).withMessage('Certification year out of range'),
];

const skillRules = [
  body('skill').trim().escape()
    .notEmpty().withMessage('Skill name is required')
    .isLength({ min: 1, max: 60 }).withMessage('Skill must be 1–60 characters'),

  body('type')
    .isIn(['technical', 'soft']).withMessage('Type must be either technical or soft'),
];

// ─── Jobs ─────────────────────────────────────────────────────────────────────
const jobRules = [
  body('title').trim().escape()
    .notEmpty().withMessage('Job title is required')
    .isLength({ min: 3, max: 120 }).withMessage('Title must be 3–120 characters'),

  body('company').trim().escape()
    .notEmpty().withMessage('Company name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Company name must be 2–100 characters'),

  body('description').trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20, max: 5000 }).withMessage('Description must be 20–5000 characters'),

  body('type')
    .isIn(['internship', 'full-time', 'part-time', 'contract'])
    .withMessage('Type must be internship, full-time, part-time, or contract'),

  body('location').trim().escape()
    .notEmpty().withMessage('Location is required')
    .isLength({ max: 100 }).withMessage('Location too long'),

  body('isRemote').optional().isBoolean().withMessage('isRemote must be true or false'),

  body('skillsRequired').optional()
    .isArray({ max: 30 }).withMessage('Too many required skills'),

  body('skillsRequired.*').optional().trim().escape()
    .isLength({ min: 1, max: 60 }).withMessage('Each skill must be 1–60 characters'),

  body('minCgpa').optional()
    .isFloat({ min: 0, max: 10 }).withMessage('Min CGPA must be between 0 and 10'),

  body('openings').optional()
    .isInt({ min: 1, max: 10000 }).withMessage('Openings must be a positive integer'),

  body('deadline').optional()
    .isISO8601().withMessage('Deadline must be a valid ISO 8601 date'),

  body('stipend').optional().trim().escape()
    .isLength({ max: 60 }).withMessage('Stipend field too long'),

  body('salary').optional().trim().escape()
    .isLength({ max: 60 }).withMessage('Salary field too long'),

  body('duration').optional().trim().escape()
    .isLength({ max: 60 }).withMessage('Duration field too long'),

  body('domain').optional().trim().escape()
    .isLength({ max: 80 }).withMessage('Domain too long'),

  body('experienceLevel').optional()
    .isIn(['fresher', 'junior', '0-1', '1-3', '3-5', '5+'])
    .withMessage('Invalid experience level'),
];

const jobQueryRules = [
  query('search').optional().trim().escape()
    .isLength({ max: 100 }).withMessage('Search query too long'),

  query('type').optional()
    .isIn(['internship', 'full-time', 'part-time', 'contract'])
    .withMessage('Invalid job type filter'),

  query('domain').optional().trim().escape()
    .isLength({ max: 80 }).withMessage('Domain filter too long'),

  query('location').optional().trim().escape()
    .isLength({ max: 100 }).withMessage('Location filter too long'),

  query('page').optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Page must be a positive integer'),

  query('limit').optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

// ─── Applications ─────────────────────────────────────────────────────────────
const applyRules = [
  body('jobId').isMongoId().withMessage('jobId must be a valid ID'),

  body('coverLetter').optional().trim().escape()
    .isLength({ max: 3000 }).withMessage('Cover letter must be 3000 characters or fewer'),

  body('matchScore').optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Match score must be between 0 and 100'),
];

const updateStatusRules = [
  body('status')
    .isIn(['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Accepted'])
    .withMessage('Status must be one of: Applied, Under Review, Shortlisted, Rejected, Accepted'),

  body('note').optional().trim().escape()
    .isLength({ max: 1000 }).withMessage('Note must be 1000 characters or fewer'),
];

// ─── Param ID validators ──────────────────────────────────────────────────────
const idParam    = [mongoId('id')];
const studentIdParam = [mongoId('studentId')];
const jobIdParam = [mongoId('jobId')];

module.exports = {
  runValidation,
  // Auth
  registerRules,
  loginRules,
  changePasswordRules,
  // Student
  updateProfileRules,
  skillRules,
  // Jobs
  jobRules,
  jobQueryRules,
  // Applications
  applyRules,
  updateStatusRules,
  // Params
  idParam,
  studentIdParam,
  jobIdParam,
};
