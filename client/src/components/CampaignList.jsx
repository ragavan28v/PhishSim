import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/campaignlist.css';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('/api/campaigns');
      setCampaigns(response.data.data || []); // Access the data array from the response
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch campaigns');
      setLoading(false);
    }
  };

  const handleLaunchCampaign = async (campaignId) => {
    try {
      await axios.post(`/api/campaigns/${campaignId}/launch`);
      // Refresh the campaigns list after launching
      fetchCampaigns();
    } catch (error) {
      setError('Failed to launch campaign');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'draft':
        return 'status-draft';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="campaign-list loading">
        <div className="loading-spinner"></div>
        <p>Loading campaigns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="campaign-list error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="campaign-list">
      <div className="campaign-list-header">
        <h1>Campaigns</h1>
        <Link to="/campaigns/new" className="btn btn-primary">
          Create Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="empty-state">
          <p>No campaigns found. Create your first campaign to get started.</p>
        </div>
      ) : (
        <div className="campaign-grid">
          {campaigns.map(campaign => (
            <div key={campaign._id} className="campaign-card">
              <div className="campaign-header">
                <h2>{campaign.name}</h2>
                <span className={`status-badge ${getStatusBadgeClass(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>

              <p className="campaign-description">{campaign.description}</p>

              <div className="campaign-stats">
                <div className="stat">
                  <span className="stat-label">Targets</span>
                  <span className="stat-value">{campaign.targets.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Clicked</span>
                  <span className="stat-value">
                    {campaign.targets.filter(t => t.status === 'clicked').length}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Submitted</span>
                  <span className="stat-value">
                    {campaign.targets.filter(t => t.status === 'submitted').length}
                  </span>
                </div>
              </div>

              <div className="campaign-dates">
                <div className="date">
                  <span className="date-label">Start</span>
                  <span className="date-value">{formatDate(campaign.startDate)}</span>
                </div>
                <div className="date">
                  <span className="date-label">End</span>
                  <span className="date-value">{formatDate(campaign.endDate)}</span>
                </div>
              </div>

              <div className="campaign-actions">
                <Link
                  to={`/campaigns/${campaign._id}`}
                  className="btn btn-secondary"
                >
                  View Details
                </Link>
                {campaign.status === 'draft' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleLaunchCampaign(campaign._id)}
                  >
                    Launch
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignList; 