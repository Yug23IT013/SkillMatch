const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProfile, updateProfile, uploadResume, addSkill, removeSkill,
  getStudentById, getDashboardStats, parseResume, bookmarkJob, getBookmarks
} = require('../controllers/studentController');
const {
  runValidation,
  updateProfileRules,
  skillRules,
  idParam,
  jobIdParam,
} = require('../middleware/validate');

router.get('/profile',  protect, authorize('student'), getProfile);
router.put('/profile',  protect, authorize('student'), updateProfileRules, runValidation, updateProfile);
router.post('/resume',  protect, authorize('student'), upload.single('resume'), uploadResume);
router.post('/parse-resume', protect, authorize('student'), upload.single('resume'), parseResume);
router.post('/skills',  protect, authorize('student'), skillRules, runValidation, addSkill);
router.delete('/skills', protect, authorize('student'), skillRules, runValidation, removeSkill);
router.get('/bookmarks', protect, authorize('student'), getBookmarks);
router.post('/bookmarks/:jobId', protect, authorize('student'), jobIdParam, runValidation, bookmarkJob);
router.get('/dashboard', protect, authorize('student'), getDashboardStats);
router.get('/:id', protect, idParam, runValidation, getStudentById);

module.exports = router;
