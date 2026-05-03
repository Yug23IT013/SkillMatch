const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  applyForJob, getMyApplications, getApplicationById, updateApplicationStatus, withdrawApplication
} = require('../controllers/applicationController');
const {
  runValidation,
  applyRules,
  updateStatusRules,
  idParam,
} = require('../middleware/validate');

router.post('/apply',    protect, authorize('student'), applyRules,       runValidation, applyForJob);
router.get('/my',        protect, authorize('student'), getMyApplications);
router.get('/:id',       protect, idParam,              runValidation,    getApplicationById);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), [...idParam, ...updateStatusRules], runValidation, updateApplicationStatus);
router.delete('/:id/withdraw', protect, authorize('student'), idParam,   runValidation, withdrawApplication);

module.exports = router;
