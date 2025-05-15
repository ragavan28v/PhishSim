const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { generatePhishingTemplate } = require('../controllers/aiController');

// All AI routes are protected and require admin access
router.use(protect);
router.use(authorize('admin'));

// Generate phishing email template
router.post('/generate-template', generatePhishingTemplate);

module.exports = router; 