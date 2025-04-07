import React, { useState, useEffect } from 'react';
import { getUserProfile, followUser } from '../utils/contractUtils';
import { getIpfsGatewayUrl } from '../utils/pinataService';

// In a real app, you would fetch suggested users from a backend
// This is a simplified version for demo purposes
const SuggestedUsers = ({ signer, account }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState({});

  // Demo addresses - in a real app, these would come from a recommendation system
  const demoAddresses = [
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
  ];
  
  // Sample users to show when there are no real users or while loading
  const sampleUsers = [
    {
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      username: 'CryptoBuilder',
      bio: 'Building the future of decentralized social media',
      profileImageHash: ''
    },
    {
      address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      username: 'Web3Explorer',
      bio: 'Exploring the possibilities of blockchain technology',
      profileImageHash: ''
    },
    {
      address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      username: 'BlockchainDev',
      bio: 'Smart contract developer and crypto enthusiast',
      profileImageHash: ''
    },
    {
      address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      username: 'DefiQueen',
      bio: 'DeFi researcher and advocate for decentralization',
      profileImageHash: ''
    },
    {
      address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
      username: 'NFTCollector',
      bio: 'Collecting digital art and supporting creators',
      profileImageHash: ''
    }
  ];

  useEffect(() => {
    const fetchSuggestedProfiles = async () => {
      if (!signer) {
        // If no signer, show sample users after brief loading
        setTimeout(() => {
          setUsers(sampleUsers);
          setLoading(false);
        }, 800);
        return;
      }
      
      setLoading(true);
      try {
        const profiles = [];
        
        for (const address of demoAddresses) {
          // Skip current user
          if (address.toLowerCase() === account?.toLowerCase()) continue;
          
          try {
            const profile = await getUserProfile(signer, address);
            if (profile && profile.username) {
              profiles.push({
                address,
                username: profile.username,
                bio: profile.bio,
                profileImageHash: profile.profileImageHash
              });
            }
          } catch (error) {
            console.error(`Error fetching profile for ${address}:`, error);
          }
        }
        
        if (profiles.length > 0) {
          setUsers(profiles);
        } else {
          // No real users found, use sample users
          setUsers(sampleUsers);
        }
      } catch (error) {
        console.error('Error fetching suggested profiles:', error);
        // Show sample users on error
        setUsers(sampleUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedProfiles();
  }, [signer, account]);

  const handleFollow = async (address) => {
    if (!signer || !account) return;
    
    setFollowLoading(prev => ({ ...prev, [address]: true }));
    
    try {
      const success = await followUser(signer, address);
      
      if (success) {
        // Update the UI to show the user has been followed
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.address === address 
              ? { ...user, followed: true } 
              : user
          )
        );
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [address]: false }));
    }
  };

  if (loading) {
    return (
      <div className="suggested-users-container">
        <h3 className="sidebar-heading">Suggested Users</h3>
        <div className="flex justify-center py-4">
          <div className="loading-spinner-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="suggested-users-container">
      <h3 className="sidebar-heading">Who to Follow</h3>
      {users.length === 0 ? (
        <p className="text-sm text-gray-500 mt-2">No suggested users available</p>
      ) : (
        <div className="suggested-users-list">
          {users.map((user) => (
            <div key={user.address} className="suggested-user-item">
              <div className="suggested-user-avatar">
                {user.profileImageHash ? (
                  <img
                    src={getIpfsGatewayUrl(user.profileImageHash)}
                    alt={user.username}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${user.username.charAt(0)}&background=6366F1&color=fff`;
                    }}
                  />
                ) : (
                  <div className="suggested-user-placeholder">
                    <span>{user.username.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="suggested-user-info">
                <h4>{user.username}</h4>
                <p className="suggested-user-address">
                  {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </p>
              </div>
              <button 
                className={`follow-button ${user.followed ? 'followed' : ''}`}
                onClick={() => !user.followed && handleFollow(user.address)}
                disabled={followLoading[user.address] || user.followed}
              >
                {followLoading[user.address] ? (
                  <div className="loading-spinner-xs"></div>
                ) : user.followed ? (
                  'Following'
                ) : (
                  'Follow'
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestedUsers; 