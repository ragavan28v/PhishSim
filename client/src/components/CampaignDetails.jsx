import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/campaigndetails.css';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relaunchLoading, setRelaunchLoading] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      console.log('Fetching campaign with ID:', id);
      const response = await axios.get(`/api/campaigns/${id}`);
      console.log('Campaign data received:', response.data);
      setCampaign(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      setError(error.response?.data?.error || 'Failed to fetch campaign details');
      setLoading(false);
    }
  };

  const handleLaunchCampaign = async () => {
    try {
      await axios.post(`/api/campaigns/${id}/launch`);
      fetchCampaign(); // Refresh campaign data
    } catch (error) {
      console.error('Error launching campaign:', error);
      setError(error.response?.data?.error || 'Failed to launch campaign');
    }
  };

  const handleRelaunchFailed = async () => {
    setRelaunchLoading(true);
    setError('');
    try {
      await axios.post(`/api/campaigns/${id}/relaunch-failed`);
      fetchCampaign(); // Refresh campaign data
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to relaunch failed targets');
    } finally {
      setRelaunchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="campaign-details loading">
        <div className="loading-spinner"></div>
        <p>Loading campaign details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="campaign-details error">
        <div className="error-message">{error}</div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/campaigns')}
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="campaign-details error">
        <div className="error-message">Campaign not found</div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/campaigns')}
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="campaign-details">
      <div className="campaign-header">
        <div className="header-content">
          <h1>{campaign.name}</h1>
          <span className={`status-badge ${campaign.status}`}>
            {campaign.status}
          </span>
        </div>
        <div className="header-actions">
          {campaign.status === 'draft' && (
            <button
              className="btn btn-primary"
              onClick={handleLaunchCampaign}
            >
              Launch Campaign
            </button>
          )}
          {campaign.status === 'active' && campaign.targets.some(t => t.status === 'failed') && (
            <button
              className="btn btn-primary"
              onClick={handleRelaunchFailed}
              disabled={relaunchLoading}
            >
              {relaunchLoading ? 'Relaunching...' : 'Relaunch Failed'}
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/campaigns')}
          >
            Back to Campaigns
          </button>
        </div>
      </div>

      <div className="campaign-content">
        <div className="campaign-info">
          <div className="info-section">
            <h2>Campaign Information</h2>
            <p className="description">{campaign.description}</p>
            <div className="dates">
              <div className="date">
                <span className="label">Start Date:</span>
                <span className="value">
                  {new Date(campaign.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="date">
                <span className="label">End Date:</span>
                <span className="value">
                  {new Date(campaign.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h2>Email Template</h2>
            <div className="template-preview">
              <h3>{campaign.emailTemplate.subject}</h3>
              <div className="template-content">
                {campaign.emailTemplate.body}
              </div>
            </div>
          </div>

          <div className="info-section">
            <h2>Targets</h2>
            <div className="targets-list">
              {campaign.targets.map((target, index) => (
                <div key={index} className="target-item">
                  <div className="target-info">
                    <span className="target-name">{target.name}</span>
                    <span className="target-email">{target.email}</span>
                  </div>
                  <span className={`target-status ${target.status}`}>
                    {target.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="campaign-stats">
          <div className="stats-section">
            <h2>Campaign Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Targets</span>
                <span className="stat-value">{campaign.targets.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Clicked</span>
                <span className="stat-value">
                  {campaign.targets.filter(t => t.status === 'clicked').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Submitted</span>
                <span className="stat-value">
                  {campaign.targets.filter(t => t.status === 'submitted').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails; 