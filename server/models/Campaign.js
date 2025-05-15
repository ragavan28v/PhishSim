const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'partial'],
    default: 'draft'
  },
  emailTemplate: {
    subject: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    tone: {
      type: String,
      enum: ['urgent', 'corporate', 'reward', 'alert'],
      required: true
    }
  },
  targets: [{
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'clicked', 'submitted', 'failed'],
      default: 'pending'
    },
    error: {
      type: String,
      default: null
    },
    sentAt: Date,
    clickedAt: Date,
    submittedAt: Date,
    geoData: {
      ip: String,
      country: String,
      city: String,
      region: String,
      browser: String,
      device: String
    },
    trackingId: {
      type: String,
      default: null
    }
  }],
  clickLogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClickLog'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
campaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for common queries
campaignSchema.index({ createdBy: 1, status: 1 });
campaignSchema.index({ 'targets.email': 1 });
campaignSchema.index({ startDate: 1, endDate: 1 });

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign; 