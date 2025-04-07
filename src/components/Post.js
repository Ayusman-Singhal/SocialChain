import React, { useState, useEffect, useRef } from 'react';
import { likePost, getUserProfile, hasUserLikedPost } from '../utils/contractUtils';
import { getIpfsGatewayUrl } from '../utils/pinataService';

const Post = ({ post, signer, account }) => {
  const [profile, setProfile] = useState(null);
  const [isLiking, setIsLiking] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageWidth, setImageWidth] = useState(0);
  
  const imageRef = useRef(null);
  
  useEffect(() => {
    const fetchAuthorProfile = async () => {
      const profileData = await getUserProfile(signer, post.author);
      setProfile(profileData);
    };
    
    if (signer && post.author) {
      fetchAuthorProfile();
    }
  }, [signer, post.author]);
  
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!signer || !account || !post.id) return;
      
      try {
        const liked = await hasUserLikedPost(signer, post.id, account);
        setHasLiked(liked);
      } catch (error) {
        console.error('Error checking if post is liked:', error);
      }
    };
    
    checkIfLiked();
  }, [signer, account, post.id]);
  
  const handleLike = async () => {
    if (!signer || !account || hasLiked) return;
    
    setIsLiking(true);
    try {
      const success = await likePost(signer, post.id);
      
      if (success) {
        setLikesCount(prevCount => prevCount + 1);
        setHasLiked(true);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };
  
  const formatDate = (date) => {
    if (!date) return '';
    
    const postDate = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d`;
    }
    
    return postDate.toLocaleDateString();
  };

  const handleImageLoad = (e) => {
    setImageLoaded(true);
    // Check if image is smaller than 600px to apply different styling
    if (e.target.naturalWidth < 600) {
      setImageWidth(e.target.naturalWidth);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <article className="post-card">
      <div className="post-header">
        {profile ? (
          <>
            <div className="avatar-container">
              {profile.profileImageHash ? (
                <img
                  src={getIpfsGatewayUrl(profile.profileImageHash)}
                  alt={profile.username}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${profile.username.charAt(0)}&background=6366F1&color=fff`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-white">
                  <span className="font-bold">{profile.username.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="post-user-info">
              <h3 className="post-username">{profile.username}</h3>
              <span className="post-time">{formatDate(post.timestamp)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="avatar-container">
              <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white">
                <span className="font-bold">{post.author.slice(2, 3).toUpperCase()}</span>
              </div>
            </div>
            <div className="post-user-info">
              <h3 className="post-username">
                {post.author.slice(0, 6)}...{post.author.slice(-4)}
              </h3>
              <span className="post-time">{formatDate(post.timestamp)}</span>
            </div>
          </>
        )}
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
      </div>
      
      {post.imageHash && !imageError && (
        <div className="post-image-container">
          <img
            ref={imageRef}
            src={getIpfsGatewayUrl(post.imageHash)}
            alt="Post content"
            className={`post-image ${imageWidth < 600 ? 'small-image' : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          />
          {!imageLoaded && (
            <div className="flex justify-center items-center py-12">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>
      )}
      
      <div className="post-actions">
        <button 
          className={`post-action-button ${hasLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={isLiking || !signer || hasLiked}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill={hasLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={hasLiked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {likesCount > 0 ? likesCount : 'Like'}
        </button>
        
        <button className="post-action-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Comment
        </button>
        
        <button className="post-action-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>
    </article>
  );
};

export default Post; 