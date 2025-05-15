const express = require('express');
const router = express.Router();
const {
  createCampaign,
  getCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  generateTemplate,
  sendCampaign,
  getCampaignStats,
  launchCampaign,
  getDashboardStats,
  relaunchFailedTargets
} = require('../controllers/campaignController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Dashboard stats route
router.get('/dashboard/stats', getDashboardStats);

// Campaign CRUD routes
router.route('/')
  .post(createCampaign)
  .get(getCampaigns);

router.route('/:id')
  .get(getCampaign)
  .put(updateCampaign)
  .delete(deleteCampaign);

// Campaign action routes
router.post('/:id/generate-template', generateTemplate);
router.post('/:id/send', sendCampaign);
router.post('/:id/launch', launchCampaign);
router.get('/:id/stats', getCampaignStats);
router.post('/:id/relaunch-failed', relaunchFailedTargets);

module.exports = router; 