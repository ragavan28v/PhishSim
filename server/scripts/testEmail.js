require('dotenv').config();
const { sendEmail } = require('../services/emailService');

const testEmail = async () => {
  try {
    // Email options
    const mailOptions = {
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'PhishHawk Email Test',
      html: `
        <h1>Email Configuration Test</h1>
        <p>If you're receiving this email, your email configuration is working correctly!</p>
        <p>Configuration details:</p>
        <ul>
          <li>SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}</li>
          <li>SMTP Port: ${process.env.SMTP_PORT || 587}</li>
          <li>From Email: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}</li>
        </ul>
      `
    };

    // Send email
    const info = await sendEmail(mailOptions);
    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending test email:', error);
    process.exit(1);
  }
};

// Run the test
testEmail(); 