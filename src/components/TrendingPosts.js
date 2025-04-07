import React, { useState, useEffect } from 'react';
import { getTrendingPosts } from '../utils/contractUtils';
import { getIpfsGatewayUrl } from '../utils/pinataService';

const TrendingPosts = ({ signer }) => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample trending posts to show when there are no real posts
  const sampleTrendingPosts = [
    {
      id: 'sample-1',
      content: 'Just created my first decentralized social media post! #blockchain #web3',
      likesCount: 42,
      imageHash: ''
    },
    {
      id: 'sample-2',
      content: 'The future of social media is decentralized. So excited to be part of this journey!',
      likesCount: 38,
      imageHash: ''
    },
    {
      id: 'sample-3',
      content: 'Who else is building on blockchain tech? Share your projects below!',
      likesCount: 29,
      imageHash: ''
    },
    {
      id: 'sample-4',
      content: 'Web3 will revolutionize how we connect online. No more centralized control!',
      likesCount: 25,
      imageHash: ''
    }
  ];

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      if (!signer) {
        // If no signer, show sample posts after brief loading delay
        setTimeout(() => {
          setTrendingPosts(sampleTrendingPosts);
          setLoading(false);
        }, 800);
        return;
      }
      
      setLoading(true);
      try {
        const posts = await getTrendingPosts(signer, 5);
        if (posts && posts.length > 0) {
          setTrendingPosts(posts);
        } else {
          // No real posts found, use sample posts
          setTrendingPosts(sampleTrendingPosts);
        }
      } catch (error) {
        console.error('Error fetching trending posts:', error);
        // Show sample posts on error
        setTrendingPosts(sampleTrendingPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPosts();
    
    // Refresh trending posts every 5 minutes
    const intervalId = setInterval(fetchTrendingPosts, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [signer]);

  const formatContent = (content) => {
    if (content.length <= 60) return content;
    return content.substring(0, 60) + '...';
  };

  if (loading) {
    return (
      <div className="trending-posts-container">
        <h3 className="sidebar-heading">Trending Posts</h3>
        <div className="flex justify-center py-4">
          <div className="loading-spinner-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="trending-posts-container">
      <h3 className="sidebar-heading">Trending Posts</h3>
      {trendingPosts.length === 0 ? (
        <p className="text-sm text-gray-500 mt-2">No trending posts yet</p>
      ) : (
        <div className="trending-posts-list">
          {trendingPosts.map((post) => (
            <div key={post.id} className="trending-post-item">
              {post.imageHash && (
                <div className="trending-post-image">
                  <img 
                    src={getIpfsGatewayUrl(post.imageHash)} 
                    alt="Post content"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
              <div className="trending-post-content">
                <p>{formatContent(post.content)}</p>
                <div className="trending-post-info">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="trending-post-icon">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{post.likesCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingPosts; 