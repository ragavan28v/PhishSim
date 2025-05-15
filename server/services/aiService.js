const axios = require('axios');

// Generate AI template for phishing campaign
exports.generateAITemplate = async (scenario, difficulty) => {
  const prompt = `You are an expert at creating phishing simulation email templates for security awareness training. 
Respond ONLY with a valid JSON object, no explanations or extra text. 
Format:
{
  "subject": "string",
  "body": "string",
  "signature": "string",
  "difficulty": "string",
  "scenario": "string"
}
Generate a ${difficulty} difficulty phishing email template for the following scenario: ${scenario}. 
The email should be professional, convincing, and include:
1. A compelling subject line
2. A greeting
3. A clear call to action (use a markdown link in the form [click here](URL) for the action, do NOT use a raw URL)
4. A sense of urgency
5. A professional signature.`;

  try {
    console.log('Sending request to Groq API...');
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating convincing but ethical phishing email templates for security awareness training. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Groq API response received');
    const template = JSON.parse(response.data.choices[0].message.content);
    
    // Validate template structure
    if (!template.subject || !template.body) {
      throw new Error('Invalid template structure received from AI');
    }

    return {
      ...template,
      createdAt: Date.now(),
      modelUsed: 'llama-3.1-8b-instant'
    };
  } catch (err) {
    console.error('AI template generation failed:', err.message);
    if (err.response) {
      console.error('API Response:', err.response.data);
    }
    
    // Fallback template with proper formatting (markdown link)
    const portalUrl = `${process.env.FRONTEND_URL}/portal`;
    return {
      subject: `URGENT: ${scenario || 'Action Required'}`,
      body: `Dear User,\n\nWe have detected unusual activity on your account that requires immediate attention. To ensure the security of your account, please verify your credentials by [clicking here](${portalUrl}).\n\nThis is a time-sensitive matter. Please take action within the next 24 hours to avoid any service interruptions.\n\nBest regards,\nIT Security Team`,
      signature: 'Best regards,\nIT Security Team',
      difficulty,
      scenario,
      createdAt: Date.now(),
      modelUsed: 'fallback'
    };
  }
};

// Generate multiple templates for a campaign
exports.generateTemplates = async (scenario, count = 3) => {
  try {
    const difficulties = ['easy', 'medium', 'hard'];
    const templates = [];

    for (let i = 0; i < count; i++) {
      const difficulty = difficulties[i % difficulties.length];
      const template = await this.generateAITemplate(scenario, difficulty);
      templates.push(template);
    }

    return templates;
  } catch (error) {
    console.error('Error generating templates:', error);
    throw new Error('Failed to generate email templates');
  }
}; 