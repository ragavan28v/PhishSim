import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/campaignform.css';

const CampaignForm = ({ campaign, isEditing }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    tone: campaign?.template?.tone || 'urgent',
    context: campaign?.template?.context || '',
    startDate: campaign?.startDate || '',
    endDate: campaign?.endDate || '',
    targets: campaign?.targets || [{ email: '', name: '', department: '' }]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTargetChange = (index, field, value) => {
    const newTargets = [...formData.targets];
    newTargets[index] = {
      ...newTargets[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      targets: newTargets
    }));
  };

  const addTarget = () => {
    setFormData(prev => ({
      ...prev,
      targets: [...prev.targets, { email: '', name: '', department: '' }]
    }));
  };

  const removeTarget = (index) => {
    setFormData(prev => ({
      ...prev,
      targets: prev.targets.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Format the data according to the API expectations
      const campaignData = {
        name: formData.name,
        description: formData.description,
        targets: formData.targets.filter(target => target.email && target.name), // Only include targets with email and name
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        tone: formData.tone,
        context: formData.context
      };

      let response;
      if (isEditing) {
        response = await axios.put(`/api/campaigns/${campaign._id}`, campaignData);
      } else {
        response = await axios.post('/api/campaigns', campaignData);
      }
      
      // Redirect to the campaign details page
      navigate(`/campaigns/${response.data.data._id}`);
    } catch (error) {
      console.error('Campaign save error:', error);
      setError(error.response?.data?.error || 'Error saving campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="campaign-form">
      <h1>{isEditing ? 'Edit Campaign' : 'Create New Campaign'}</h1>
      
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Campaign Details</h2>
          <div className="form-group">
            <label htmlFor="name">Campaign Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Email Template</h2>
          <div className="form-group">
            <label htmlFor="tone">Email Tone</label>
            <select
              id="tone"
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              required
            >
              <option value="urgent">Urgent</option>
              <option value="corporate">Corporate</option>
              <option value="reward">Reward-based</option>
              <option value="alert">Alert</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="context">Email Context</label>
            <textarea
              id="context"
              name="context"
              value={formData.context}
              onChange={handleChange}
              placeholder="Describe the scenario for the AI to generate the email template..."
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Targets</h2>
          {formData.targets.map((target, index) => (
            <div key={index} className="target-group">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor={`email-${index}`}>Email</label>
                  <input
                    type="email"
                    id={`email-${index}`}
                    value={target.email}
                    onChange={(e) => handleTargetChange(index, 'email', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`name-${index}`}>Name</label>
                  <input
                    type="text"
                    id={`name-${index}`}
                    value={target.name}
                    onChange={(e) => handleTargetChange(index, 'name', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`department-${index}`}>Department</label>
                  <input
                    type="text"
                    id={`department-${index}`}
                    value={target.department}
                    onChange={(e) => handleTargetChange(index, 'department', e.target.value)}
                  />
                </div>

                {index > 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary remove-target"
                    onClick={() => removeTarget(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            className="btn add-target"
            onClick={addTarget}
          >
            Add Target
          </button>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/campaigns')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Campaign' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignForm; 