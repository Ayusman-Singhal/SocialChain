import React, { useState, useEffect, useRef } from 'react';
import { connectWallet, getUserProfile } from '../utils/contractUtils';
import { getIpfsGatewayUrl } from '../utils/pinataService';

const Header = ({ account, setAccount, setSigner, signer }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch user profile when account changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!account || !signer) return;
      
      setLoading(true);
      try {
        const profileData = await getUserProfile(signer, account);
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [account, signer]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleConnect = async () => {
    const walletInfo = await connectWallet();
    if (walletInfo) {
      setAccount(walletInfo.address);
      setSigner(walletInfo.signer);
    }
  };

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const navigateToProfile = () => {
    // Find and click the Profile link in the sidebar
    const profileLink = document.querySelector('a[href="#profile"]');
    if (profileLink) {
      profileLink.click();
    }
    setShowDropdown(false);
  };

  const handleDisconnect = () => {
    setAccount(null);
    setSigner(null);
    setProfile(null);
    setShowDropdown(false);
  };

  return (
    <div className="flex items-center relative">
      {account ? (
        <div className="relative" ref={dropdownRef}>
          <button 
            className="profile-button" 
            onClick={handleProfileClick}
            aria-label="Profile menu"
          >
            {profile && profile.profileImageHash ? (
              <img
                src={getIpfsGatewayUrl(profile.profileImageHash)}
                alt={profile.username || "User profile"}
                className="rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  // Show fallback avatar
                  e.target.parentNode.querySelector('.avatar-placeholder').style.display = 'flex';
                }}
              />
            ) : (
              <div className="avatar-placeholder">
                {account.slice(2, 3).toUpperCase()}
              </div>
            )}
            <span className="hidden md:inline">
              {profile && profile.username 
                ? profile.username 
                : `${account.slice(0, 6)}...${account.slice(-4)}`
              }
            </span>
            <span className="bg-green-500 rounded-full h-2 w-2 inline-block ml-2"></span>
          </button>
          
          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-10 border border-gray-200">
              <div className="py-2">
                <div className="px-4 py-2 text-sm text-gray-500">
                  Signed in as
                </div>
                <div className="px-4 pb-2 font-semibold truncate">
                  {profile && profile.username 
                    ? profile.username 
                    : `${account.slice(0, 6)}...${account.slice(-4)}`
                  }
                </div>
              </div>
              <div className="border-t border-gray-200">
                <button
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  onClick={navigateToProfile}
                >
                  Your Profile
                </button>
                <button
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  onClick={handleDisconnect}
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button 
          onClick={handleConnect}
          className="post-button"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default Header; 