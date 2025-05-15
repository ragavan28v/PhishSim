import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/warningpage.css';

const WarningPage = () => {
  return (
    <div className="warning-page">
      <div className="warning-container">
        <div className="warning-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1>You've Been Phished!</h1>
        
        <div className="warning-content">
          <p>
            This was a simulated phishing attack as part of your organization's security awareness training.
            The information you entered was not actually sent to any malicious actors.
          </p>

          <div className="warning-details">
            <h2>What happened?</h2>
            <ul>
              <li>You clicked on a link in a simulated phishing email</li>
              <li>You entered your credentials on a fake login page</li>
              <li>This was all part of a controlled security exercise</li>
            </ul>

            <h2>How to stay safe:</h2>
            <ul>
              <li>Always verify the sender's email address</li>
              <li>Check for suspicious URLs before clicking</li>
              <li>Never enter credentials on unfamiliar pages</li>
              <li>Report suspicious emails to IT Security</li>
            </ul>
          </div>

          <div className="warning-actions">
            <Link to="/training" className="btn btn-primary">
              Take Security Training
            </Link>
            <Link to="/report" className="btn btn-secondary">
              Report Suspicious Emails
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarningPage; 