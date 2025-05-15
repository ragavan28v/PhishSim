const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/v1/chat/completions';

const generateTemplate = async (tone, context) => {
  try {
    const prompt = generatePrompt(tone, context);
    
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama2-70b-4096',
        messages: [
          {
            role: 'system',
            content: 'You are a professional email template generator specializing in creating convincing but ethical phishing simulation emails.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const template = response.data.choices[0].message.content;
    return parseTemplate(template);
  } catch (error) {
    console.error('Error generating template:', error);
    throw new Error('Failed to generate email template');
  }
};

const generatePrompt = (tone, context) => {
  const basePrompt = `Generate a professional phishing simulation email template with the following characteristics:
    - Tone: ${tone}
    - Context: ${context}
    - Include a subject line
    - Include a greeting
    - Include a main body
    - Include a call to action
    - Include a signature
    Format the response as JSON with the following structure:
    {
      "subject": "string",
      "greeting": "string",
      "body": "string",
      "callToAction": "string",
      "signature": "string"
    }`;

  return basePrompt;
};

const parseTemplate = (template) => {
  try {
    // Extract JSON from the response
    const jsonMatch = template.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid template format');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      subject: parsed.subject,
      greeting: parsed.greeting,
      body: parsed.body,
      callToAction: parsed.callToAction,
      signature: parsed.signature
    };
  } catch (error) {
    console.error('Error parsing template:', error);
    throw new Error('Failed to parse email template');
  }
};

module.exports = {
  generateTemplate
}; 