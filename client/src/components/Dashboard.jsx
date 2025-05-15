import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import '../styles/dashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalTargets: 0,
    totalClicks: 0,
    totalSubmissions: 0,
    recentCampaigns: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/campaigns/dashboard/stats');
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Emails Sent', 'Clicks', 'Submissions'],
    datasets: [
      {
        label: 'Campaign Metrics',
        data: [
          stats.totalTargets,
          stats.totalClicks,
          stats.totalSubmissions
        ],
        backgroundColor: [
          'rgba(0, 191, 255, 0.6)',
          'rgba(255, 99, 71, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ]
      }
    ]
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/campaigns/new" className="btn">
          Create New Campaign
        </Link>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <h3>Total Campaigns</h3>
          <p className="stat-number">{stats.totalCampaigns}</p>
        </div>
        <div className="glass-card stat-card">
          <h3>Active Campaigns</h3>
          <p className="stat-number">{stats.activeCampaigns}</p>
        </div>
        <div className="glass-card stat-card">
          <h3>Total Targets</h3>
          <p className="stat-number">{stats.totalTargets}</p>
        </div>
        <div className="glass-card stat-card">
          <h3>Click Rate</h3>
          <p className="stat-number">
            {((stats.totalClicks / stats.totalTargets) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="charts-container">
        <div className="glass-card chart-card">
          <h3>Campaign Metrics</h3>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Campaign Performance'
                }
              }
            }}
          />
        </div>
      </div>

      <div className="recent-campaigns">
        <h2>Recent Campaigns</h2>
        <div className="campaigns-list">
          {stats.recentCampaigns.map(campaign => (
            <div key={campaign._id} className="glass-card campaign-card">
              <h3>{campaign.name}</h3>
              <p>{campaign.description}</p>
              <div className="campaign-stats">
                <span>Status: {campaign.status}</span>
                <span>Targets: {campaign.targets.length}</span>
                <span>
                  Click Rate:{' '}
                  {((campaign.stats.clicks / campaign.targets.length) * 100).toFixed(1)}%
                </span>
              </div>
              <Link to={`/campaigns/${campaign._id}`} className="btn btn-secondary">
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 