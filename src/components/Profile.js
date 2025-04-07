import React, { useState, useEffect, useCallback } from 'react';
import { createProfile, getUserProfile, followUser } from '../utils/contractUtils';
import { uploadToPinata, getIpfsGatewayUrl } from '../utils/pinataService';

const Profile = ({ account, signer, userAddress, onProfileCreated }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageHash, setProfileImageHash] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const isOwnProfile = !userAddress || userAddress === account;
  const targetAddress = userAddress || account;

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profileData = await getUserProfile(signer, targetAddress);
      setProfile(profileData);
      
      if (profileData) {
        setUsername(profileData.username);
        setBio(profileData.bio);
        setProfileImageHash(profileData.profileImageHash);
        
        if (profileData.profileImageHash) {
          setImagePreview(getIpfsGatewayUrl(profileData.profileImageHash));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [signer, targetAddress]);

  useEffect(() => {
    if (signer && targetAddress) {
      loadProfile();
    }
  }, [signer, targetAddress, loadProfile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setProfileImage(file);
    
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let imageHash = profileImageHash;
      
      if (profileImage) {
        setUploading(true);
        imageHash = await uploadToPinata(profileImage);
        setUploading(false);
        
        if (!imageHash) {
          setError('Failed to upload profile image');
          setLoading(false);
          return;
        }
        
        setProfileImageHash(imageHash);
      }
      
      const success = await createProfile(signer, username, bio, imageHash);
      
      if (success) {
        await loadProfile();
        setIsEditing(false);
        setProfileImage(null);
        
        if (onProfileCreated && (!profile || !profile.username)) {
          onProfileCreated();
        }
      } else {
        setError('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!signer || isOwnProfile) return;
    
    setLoading(true);
    setError('');
    try {
      const success = await followUser(signer, targetAddress);
      
      if (success) {
        await loadProfile();
      } else {
        setError('Failed to follow user');
      }
    } catch (error) {
      console.error('Error following user:', error);
      setError('Error following user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing) {
    return (
      <div className="loading-indicator">
        <div className="post-card">
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary-color" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !profile.username) {
    if (isOwnProfile) {
      return (
        <div className="profile-card fade-in mb-4">
          {error && (
            <div className="alert alert-danger mb-4">
              {error}
            </div>
          )}
          
          <div className="profile-cover"></div>
          <div className="profile-info">
            <h2 className="text-2xl font-bold mb-6">Create Your Profile</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  required
                  disabled={loading || uploading}
                  placeholder="Enter a username"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="form-input"
                  rows="3"
                  disabled={loading || uploading}
                  placeholder="Tell us about yourself"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Profile Image</label>
                
                {imagePreview && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-24 h-24 object-cover rounded-full mb-2"
                    />
                  </div>
                )}
                
                <div>
                  <label className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md cursor-pointer hover:bg-gray-300 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" clipRule="evenodd" />
                      <path d="M4 12l4-4 2 2 4-4 4 4v4H4v-4z" />
                    </svg>
                    Select Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={loading || uploading}
                    />
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                className="post-button w-full"
                disabled={loading || uploading}
              >
                {(loading || uploading) && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {uploading ? 'Uploading...' : loading ? 'Creating...' : 'Create Profile'}
              </button>
            </form>
          </div>
        </div>
      );
    }
    
    return (
      <div className="post-card text-center py-8 fade-in">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="profile-card fade-in">
      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}
      
      {isEditing ? (
        <>
          <div className="profile-cover"></div>
          <div className="profile-info">
            <h2 className="text-2xl font-bold mb-6">Edit Your Profile</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Username <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  required
                  disabled={loading || uploading}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="form-input"
                  rows="3"
                  disabled={loading || uploading}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Profile Image</label>
                
                {imagePreview && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-24 h-24 object-cover rounded-full mb-2"
                    />
                  </div>
                )}
                
                <div>
                  <label className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md cursor-pointer hover:bg-gray-300 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" clipRule="evenodd" />
                      <path d="M4 12l4-4 2 2 4-4 4 4v4H4v-4z" />
                    </svg>
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={loading || uploading}
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="post-button flex-1"
                  disabled={loading || uploading}
                >
                  {(loading || uploading) && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Save Profile'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-full font-bold transition-colors flex-1"
                  disabled={loading || uploading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        <>
          <div className="profile-cover"></div>
          <div className="profile-info">
            {profile.profileImageHash ? (
              <img
                src={getIpfsGatewayUrl(profile.profileImageHash)}
                alt={profile.username}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar bg-primary-color flex items-center justify-center">
                <span className="text-2xl text-white font-bold">{profile.username.charAt(0).toUpperCase()}</span>
              </div>
            )}
            
            <div className="flex justify-end">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="border border-gray-300 text-black font-bold px-4 py-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  className="post-button"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Follow'}
                </button>
              )}
            </div>
            
            <h1 className="profile-name">{profile.username}</h1>
            <p className="profile-username">@{profile.username.toLowerCase().replace(/\s/g, '')}</p>
            
            {profile.bio && (
              <div className="profile-bio">
                {profile.bio}
              </div>
            )}
            
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">{profile.followersCount}</span>
                <span className="profile-stat-label"> Followers</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{profile.followingCount}</span>
                <span className="profile-stat-label"> Following</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile; 