# PhishSim 🦅

A MERN stack phishing simulation platform with AI-generated templates, Geo/IP analytics, and multi-layered phishing attack scenarios.

## Features

- 🤖 AI-Driven Phishing Campaign Generator
- 📊 Real-time Analytics Dashboard
- 🌍 Geo/IP Tracking
- 📧 Customizable Email Templates
- 🔒 Multi-level Phishing Simulations
- 📈 Comprehensive Reporting

## Tech Stack

- MongoDB
- Express.js
- React.js
- Node.js
- Vanilla CSS

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/phishsim.git
cd phishsim
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=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
```

5. Start the development servers:

In the server directory:
```bash
npm run dev
```

In the client directory:
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
/client
  /public
  /src
    /components
    /pages
    /styles
    App.js
    index.js

/server
  /controllers
  /routes
  /models
  /utils
  server.js
```

## Security Note

This platform is designed for educational and training purposes only. Always ensure you have proper authorization before running phishing simulations against any targets.

## License

MIT License - See LICENSE file for details 