const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getRecommendations, getMLRecommendations, getMissingSkillSuggestions,
  getMostDemandedSkills, getResumeRecommendations
} = require('../controllers/recommendationController');
const { runValidation, studentIdParam } = require('../middleware/validate');

router.get('/ml',            protect, authorize('student'), getMLRecommendations);
router.get('/missing-skills', protect, authorize('student'), getMissingSkillSuggestions);
router.get('/market-skills', protect, getMostDemandedSkills);
router.get('/from-resume',   protect, authorize('student'), getResumeRecommendations);
router.get('/:studentId',    protect, studentIdParam, runValidation, getRecommendations);

module.exports = router;
