import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getIpfsGatewayUrl } from '../../utils/pinataService';
import '../../styles/Explore.css';

const CrowdfundingTab = ({ account, signer }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    durationInDays: '',
    imageFile: null
  });

  useEffect(() => {
    if (signer) {
      fetchCampaigns();
    }
  }, [signer]);

  const fetchCampaigns = async () => {
    try {
      // This will be replaced with actual contract calls once deployed
      // const crowdfundingContract = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, signer);
      // const activeCampaigns = await crowdfundingContract.getActiveCampaigns();
      // const campaignDetails = await Promise.all(activeCampaigns.map(id => crowdfundingContract.getCampaign(id)));
      // setCampaigns(campaignDetails);
      
      // Temporary mock data
      setCampaigns([
        {
          id: 1,
          creator: '0x123...',
          title: 'Build a Community Garden',
          description: 'Help us create a beautiful community garden in the heart of the city.',
          imageHash: 'QmSample1',
          goalAmount: ethers.utils.parseEther('10'),
          currentAmount: ethers.utils.parseEther('5'),
          deadline: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          isActive: true,
          isFunded: false,
          timestamp: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60,
          backersCount: 25
        },
        {
          id: 2,
          creator: '0x456...',
          title: 'Local Food Bank Support',
          description: 'Support our local food bank to help families in need.',
          imageHash: 'QmSample2',
          goalAmount: ethers.utils.parseEther('5'),
          currentAmount: ethers.utils.parseEther('4.5'),
          deadline: Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60,
          isActive: true,
          isFunded: false,
          timestamp: Math.floor(Date.now() / 1000) - 3 * 24 * 60 * 60,
          backersCount: 15
        }
      ]);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      // This will be replaced with actual contract calls once deployed
      // const crowdfundingContract = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, signer);
      // const tx = await crowdfundingContract.createCampaign(
      //   formData.title,
      //   formData.description,
      //   formData.imageHash,
      //   ethers.utils.parseEther(formData.goalAmount),
      //   parseInt(formData.durationInDays)
      // );
      // await tx.wait();
      
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        goalAmount: '',
        durationInDays: '',
        imageFile: null
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleContribute = async (campaignId, amount) => {
    try {
      // This will be replaced with actual contract calls once deployed
      // const crowdfundingContract = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, signer);
      // const tx = await crowdfundingContract.contribute(campaignId, { value: ethers.utils.parseEther(amount) });
      // await tx.wait();
      
      fetchCampaigns();
    } catch (error) {
      console.error('Error contributing to campaign:', error);
    }
  };

  const formatTimeLeft = (deadline) => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = deadline - now;
    
    if (timeLeft <= 0) return 'Ended';
    
    const days = Math.floor(timeLeft / (24 * 60 * 60));
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
    
    return `${days}d ${hours}h left`;
  };

  const formatProgress = (current, goal) => {
    const progress = (current / goal) * 100;
    return Math.min(progress, 100).toFixed(1);
  };

  return (
    <div className="crowdfunding-container">
      <div className="crowdfunding-header">
        <h3>Active Campaigns</h3>
        <button 
          className="create-campaign-button"
          onClick={() => setShowCreateModal(true)}
        >
          Create Campaign
        </button>
      </div>
      
      {loading ? (
        <div className="loading">Loading campaigns...</div>
      ) : campaigns.length > 0 ? (
        <div className="campaigns-grid">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="campaign-card">
              <div className="campaign-image">
                <img 
                  src={getIpfsGatewayUrl(campaign.imageHash)} 
                  alt={campaign.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Campaign+Image';
                  }}
                />
              </div>
              <div className="campaign-content">
                <h4>{campaign.title}</h4>
                <p>{campaign.description}</p>
                <div className="campaign-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${formatProgress(campaign.currentAmount, campaign.goalAmount)}%` }}
                    />
                  </div>
                  <div className="progress-stats">
                    <span>{ethers.utils.formatEther(campaign.currentAmount)} ETH raised</span>
                    <span>of {ethers.utils.formatEther(campaign.goalAmount)} ETH goal</span>
                  </div>
                </div>
                <div className="campaign-footer">
                  <span className="time-left">{formatTimeLeft(campaign.deadline)}</span>
                  <span className="backers-count">{campaign.backersCount} backers</span>
                  <button 
                    className="contribute-button"
                    onClick={() => handleContribute(campaign.id, '0.1')}
                  >
                    Contribute
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-campaigns">No active campaigns found</div>
      )}
      
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create Campaign</h3>
            <form onSubmit={handleCreateCampaign}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Goal Amount (ETH)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.goalAmount}
                  onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.durationInDays}
                  onChange={(e) => setFormData({ ...formData, durationInDays: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Campaign Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, imageFile: e.target.files[0] })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit">Create Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrowdfundingTab; 