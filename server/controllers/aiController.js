const axios = require('axios');

/**
 * Generate a phishing email template using AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generatePhishingTemplate = async (req, res) => {
  try {
    const { tone, scenario, targetRole } = req.body;

    // Validate required fields
    if (!tone || !scenario || !targetRole) {
      return res.status(400).json({
        success: false,
        error: 'Please provide tone, scenario, and target role'
      });
    }

    // Call Groq AI API to generate template
    const response = await axios.post(
      'https://api.groq.com/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating convincing but ethical phishing email templates for security awareness training.'
          },
          {
            role: 'user',
            content: `Create a phishing email template with the following parameters:
              - Tone: ${tone}
              - Scenario: ${scenario}
              - Target Role: ${targetRole}
              
              The email should be convincing but not malicious. Include:
              1. A compelling subject line
              2. Professional email body
              3. A call to action
              4. Sender details
              
              Format the response as JSON with subject and body fields.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Parse the AI response
    const aiResponse = response.data.choices[0].message.content;
    const template = JSON.parse(aiResponse);

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({
      success: false,
      error: 'Error generating email template',
      details: error.message
    });
  }
}; 