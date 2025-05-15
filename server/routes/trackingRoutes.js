const express = require('express');
const router = express.Router();
const {
  trackClick,
  trackSubmission,
  getCampaignStats,
  getClickAnalytics,
  getRealtimeClicks
} = require('../controllers/trackingController');
const { protect, authorize } = require('../middleware/auth');

// Public routes for tracking
router.get('/click/:campaignId/:userId', trackClick);
router.post('/submit/:campaignId/:userId', trackSubmission);

// Protected routes for analytics
router.use(protect);
router.get('/analytics/:campaignId', getClickAnalytics);
router.get('/realtime/:campaignId', getRealtimeClicks);
router.get('/stats/:campaignId', authorize('admin'), getCampaignStats);

module.exports = router; 