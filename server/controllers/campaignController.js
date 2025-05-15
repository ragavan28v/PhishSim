const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { generateAITemplate } = require('../services/aiService');
const { sendPhishingEmail } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

// Create a new campaign
exports.createCampaign = async (req, res) => {
  try {
    const { name, description, targets, startDate, endDate, tone, context } = req.body;
    const userId = req.user.id;

    console.log('Generating AI template for campaign:', {
      context: context || description,
      tone: tone || 'urgent'
    });

    // Generate AI email template
    let aiTemplate;
    try {
      aiTemplate = await generateAITemplate(context || description, tone || 'urgent');
      console.log('AI template generated successfully:', {
        subject: aiTemplate.subject,
        modelUsed: aiTemplate.modelUsed
      });

      // Ensure portal URL is included in the template
      if (!aiTemplate.body.includes(process.env.FRONTEND_URL)) {
        const portalUrl = `${process.env.FRONTEND_URL}/portal`;
        aiTemplate.body = aiTemplate.body.replace(
          /(click here|click the link|verify your credentials|login)/i,
          `[click here](${portalUrl})`
        );
      }
    } catch (aiError) {
      console.error('AI template generation failed:', aiError);
      // Fallback to manual template
      const portalUrl = `${process.env.FRONTEND_URL}/portal`;
      aiTemplate = {
        subject: `URGENT: ${context || 'Action Required'}`,
        body: `Dear User,

We have detected unusual activity on your account that requires immediate attention. To ensure the security of your account, please verify your credentials by clicking the link below:

${portalUrl}

This is a time-sensitive matter. Please take action within the next 24 hours to avoid any service interruptions.

Best regards,
IT Security Team`,
        tone: tone || 'urgent',
        modelUsed: 'fallback'
      };
      console.log('Using fallback template:', {
        subject: aiTemplate.subject,
        modelUsed: aiTemplate.modelUsed
      });
    }

    // Create campaign with proper schema
    const campaign = new Campaign({
      name,
      description,
      targets: targets.map(target => ({
        email: target.email,
        name: target.name,
        department: target.department,
        status: 'pending'
      })),
      emailTemplate: {
        subject: aiTemplate.subject,
        body: aiTemplate.body,
        tone: tone || 'urgent'
      },
      startDate,
      endDate,
      createdBy: userId,
      status: 'draft'
    });

    await campaign.save();
    console.log('Campaign created successfully:', campaign._id);

    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all campaigns for a user
exports.getCampaigns = async (req, res) => {
  try {
    const userId = req.user.id;
    const campaigns = await Campaign.find({ createdBy: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single campaign
exports.getCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    console.log('Fetching campaign with ID:', campaignId);

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      console.log('Invalid campaign ID format:', campaignId);
      return res.status(400).json({
        success: false,
        error: 'Invalid campaign ID format'
      });
    }

    const campaign = await Campaign.findById(campaignId)
      .populate('createdBy', 'name email');

    if (!campaign) {
      console.log('Campaign not found for ID:', campaignId);
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Check if user is authorized
    if (campaign.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
      console.log('Unauthorized access attempt for campaign:', campaignId);
      console.log('User ID:', req.user.id);
      console.log('Campaign creator ID:', campaign.createdBy._id.toString());
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this campaign'
      });
    }

    console.log('Successfully retrieved campaign:', campaignId);
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update campaign
exports.updateCampaign = async (req, res) => {
  try {
    const { name, description, targets, startDate, endDate, tone, context } = req.body;
    
    let campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Check if user is authorized
    if (campaign.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this campaign'
      });
    }

    // Update fields
    campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        targets: targets.map(target => ({
          email: target.email,
          name: target.name,
          department: target.department,
          status: target.status || 'pending'
        })),
        emailTemplate: {
          subject: `Important: ${context || 'Action Required'}`,
          body: context || 'Please review the attached document.',
          tone: tone || 'urgent'
        },
        startDate,
        endDate
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Campaign update error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Check if user is authorized
    if (campaign.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this campaign'
      });
    }

    await campaign.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Generate AI template for campaign
exports.generateTemplate = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { scenario, difficulty } = req.body;

    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Generate AI template
    const template = await generateAITemplate(scenario, difficulty);

    // Update campaign with template
    campaign.template = template;
    await campaign.save();

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send campaign emails
exports.sendCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Check if user is authorized
    if (campaign.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to send this campaign'
      });
    }

    // Send emails to all targets
    const emailPromises = campaign.targetEmails.map(target => 
      sendPhishingEmail({
        to: target,
        campaignId: campaign._id,
        template: campaign.template
      })
    );

    await Promise.all(emailPromises);

    // Update campaign status
    campaign.status = 'sent';
    campaign.sentAt = Date.now();
    await campaign.save();

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get campaign statistics
exports.getCampaignStats = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('clickLogs');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Calculate statistics
    const stats = {
      totalTargets: campaign.targetEmails.length,
      emailsSent: campaign.sentAt ? campaign.targetEmails.length : 0,
      clicks: campaign.clickLogs.length,
      clickRate: campaign.sentAt ? 
        (campaign.clickLogs.length / campaign.targetEmails.length * 100).toFixed(2) : 0,
      uniqueClicks: new Set(campaign.clickLogs.map(log => log.userId)).size,
      lastClick: campaign.clickLogs.length > 0 ? 
        campaign.clickLogs[campaign.clickLogs.length - 1].timestamp : null
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

// Launch campaign
exports.launchCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Campaign can only be launched from draft status'
      });
    }

    // Generate tracking links and send emails
    const results = {
      success: [],
      failed: []
    };

    for (const target of campaign.targets) {
      const trackingId = uuidv4();
      const portalUrl = `${process.env.FRONTEND_URL}/portal/${campaign._id}/${trackingId}`;

      // Save the trackingId to the target for later lookup
      target.trackingId = trackingId;

      try {
        // Replace any existing URLs in the template with the portal URL
        const emailBody = campaign.emailTemplate.body.replace(
          /\[click here\]\(.*?\)/g,
          `[click here](${portalUrl})`
        );

        await sendPhishingEmail({
          to: target.email,
          subject: campaign.emailTemplate.subject,
          html: emailBody,
          text: emailBody,
          trackingId: trackingId
        });
        target.status = 'sent';
        target.sentAt = Date.now();
        results.success.push(target.email);
      } catch (error) {
        target.status = 'failed';
        target.error = error.message;
        results.failed.push({
          email: target.email,
          error: error.message
        });
        console.error(`Failed to send email to ${target.email}:`, error);
      }
    }

    // Mark targets as modified and save once after the loop
    campaign.markModified('targets');
    campaign.status = results.failed.length === 0 ? 'active' : 'partial';
    await campaign.save();

    res.json({
      success: true,
      data: {
        campaign,
        results
      }
    });
  } catch (error) {
    console.error('Error launching campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Error launching campaign',
      error: error.message
    });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all campaigns for the user
    const campaigns = await Campaign.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5); // Get 5 most recent campaigns

    // Calculate total statistics
    const stats = {
      totalCampaigns: await Campaign.countDocuments({ createdBy: userId }),
      activeCampaigns: await Campaign.countDocuments({ 
        createdBy: userId,
        status: 'active'
      }),
      totalTargets: campaigns.reduce((sum, campaign) => sum + campaign.targets.length, 0),
      totalClicks: campaigns.reduce((sum, campaign) => 
        sum + campaign.targets.filter(t => t.status === 'clicked').length, 0),
      totalSubmissions: campaigns.reduce((sum, campaign) => 
        sum + campaign.targets.filter(t => t.status === 'submitted').length, 0),
      recentCampaigns: campaigns.map(campaign => ({
        _id: campaign._id,
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        targets: campaign.targets,
        stats: {
          clicks: campaign.targets.filter(t => t.status === 'clicked').length,
          submissions: campaign.targets.filter(t => t.status === 'submitted').length
        }
      }))
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Relaunch failed targets
exports.relaunchFailedTargets = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!campaign) {
      console.error('Relaunch: Campaign not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Only allow relaunch if there are failed targets
    const failedTargets = campaign.targets.filter(t => t.status === 'failed');
    if (failedTargets.length === 0) {
      console.warn('Relaunch: No failed targets to relaunch for campaign:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'No failed targets to relaunch.'
      });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const target of failedTargets) {
      const trackingId = uuidv4();
      const trackingLink = `${process.env.FRONTEND_URL}/track/${campaign._id}/${trackingId}`;
      try {
        await sendPhishingEmail({
          to: target.email,
          subject: campaign.emailTemplate.subject,
          html: campaign.emailTemplate.body,
          text: campaign.emailTemplate.body,
          trackingId: trackingId
        });
        target.status = 'sent';
        target.sentAt = Date.now();
        target.error = null;
        results.success.push(target.email);
      } catch (error) {
        target.status = 'failed';
        target.error = error.message;
        results.failed.push({
          email: target.email,
          error: error.message
        });
        console.error(`Relaunch: Failed to resend email to ${target.email}:`, error);
      }
    }

    // Update campaign status
    if (results.failed.length === 0) {
      campaign.status = 'active';
    }

    await campaign.save();
    res.json({
      success: true,
      data: {
        campaign,
        results
      }
    });
  } catch (error) {
    console.error('Relaunch: Internal server error:', error);
    res.status(500).json({
      success: false,
      message: 'Error relaunching failed targets',
      error: error.message
    });
  }
}; 