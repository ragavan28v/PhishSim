const mongoose = require('mongoose');

const clickLogSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign.targets',
    required: true
  },
  action: {
    type: String,
    enum: ['click', 'submit', 'download'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  geoData: {
    ip: String,
    country: String,
    city: String,
    region: String,
    browser: String,
    device: String,
    userAgent: String
  },
  submittedData: {
    username: String,
    password: String,
    otherFields: mongoose.Schema.Types.Mixed
  },
  isSimulation: {
    type: Boolean,
    default: true
  }
});

// Index for faster queries
clickLogSchema.index({ campaign: 1, target: 1, timestamp: -1 });
clickLogSchema.index({ 'geoData.ip': 1 });

const ClickLog = mongoose.model('ClickLog', clickLogSchema);

module.exports = ClickLog; 