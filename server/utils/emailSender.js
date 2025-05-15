const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendPhishingEmail = async (target, campaign, trackingLink) => {
  try {
    const { template } = campaign;
    const emailContent = generateEmailContent(template, trackingLink);

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: target.email,
      subject: template.subject,
      html: emailContent,
      attachments: template.attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

const generateEmailContent = (template, trackingLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>${template.greeting}</p>
        <div style="margin: 20px 0;">
          ${template.body}
        </div>
        <div style="margin: 20px 0;">
          <a href="${trackingLink}" 
             style="display: inline-block; 
                    padding: 10px 20px; 
                    background-color: #007bff; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px;">
            ${template.callToAction}
          </a>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          ${template.signature}
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendPhishingEmail
}; 