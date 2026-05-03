const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  runValidation,
  registerRules,
  loginRules,
  changePasswordRules,
} = require('../middleware/validate');

router.post('/register', authLimiter, registerRules, runValidation, register);
router.post('/login',    authLimiter, loginRules,    runValidation, login);
router.get('/me', protect, getMe);
router.put('/change-password', authLimiter, protect, changePasswordRules, runValidation, changePassword);

module.exports = router;
