const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAnalytics, getAllUsers, toggleUserStatus, deleteUser, getAllJobs } = require('../controllers/adminController');

router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/toggle', protect, authorize('admin'), toggleUserStatus);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.get('/jobs', protect, authorize('admin'), getAllJobs);

module.exports = router;
