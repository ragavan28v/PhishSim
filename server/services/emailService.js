const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Only for development
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email service configuration error:', error);
  } else {
    console.log('Email service is ready to send messages');
  }
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body in HTML format
 * @param {string} options.text - Email body in plain text format
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    throw new Error('Recipient email address is required');
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send a phishing simulation email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body in HTML format
 * @param {string} options.text - Email body in plain text format
 * @param {string} options.trackingId - Unique tracking ID for the email
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendPhishingEmail = async ({ to, subject, html, text, trackingId }) => {
  if (!to) {
    throw new Error('Recipient email address is required');
  }

  try {
    // Add tracking pixel to HTML content
    const trackingPixel = `<img src="${process.env.FRONTEND_URL}/api/tracking/pixel/${trackingId}" width="1" height="1" style="display:none" />`;
    const htmlWithTracking = html + trackingPixel;

    // Convert markdown links to HTML links
    const htmlWithLinks = htmlWithTracking.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" style="color: #007bff; text-decoration: none;">$1</a>'
    );

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html: htmlWithLinks,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Phishing email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending phishing email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendPhishingEmail
}; 