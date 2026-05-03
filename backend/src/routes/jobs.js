const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getJobs, getJobById, createJob, updateJob, deleteJob, getRecruiterJobs, getJobApplicants
} = require('../controllers/jobController');
const {
  runValidation,
  jobRules,
  jobQueryRules,
  idParam,
} = require('../middleware/validate');

router.get('/',          protect, jobQueryRules,     runValidation, getJobs);
router.get('/my-jobs',   protect, authorize('recruiter'), getRecruiterJobs);
router.get('/:id',       protect, idParam,           runValidation, getJobById);
router.post('/',         protect, authorize('recruiter', 'admin'), jobRules, runValidation, createJob);
router.put('/:id',       protect, authorize('recruiter', 'admin'), [...idParam, ...jobRules], runValidation, updateJob);
router.delete('/:id',    protect, authorize('recruiter', 'admin'), idParam, runValidation, deleteJob);
router.get('/:id/applicants', protect, authorize('recruiter', 'admin'), idParam, runValidation, getJobApplicants);

module.exports = router;
