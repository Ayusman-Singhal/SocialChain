import React, { useState, useEffect } from 'react';
import Post from './Post';
import { getAllPosts } from '../utils/contractUtils';

const Explore = ({ account, signer }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPosts = async () => {
      if (!signer) return;
      
      setLoading(true);
      try {
        // Get all posts, limit to 50 for performance
        const allPosts = await getAllPosts(signer, 50);
        
        // Sort by timestamp (newest first)
        allPosts.sort((a, b) => b.timestamp - a.timestamp);
        
        setPosts(allPosts);
      } catch (error) {
        console.error('Error fetching posts for explore:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, [signer]);

  return (
    <div className="explore-container fade-in">
      <div className="explore-header">
        <h2 className="explore-title">Explore</h2>
        <p className="explore-subtitle">Discover posts from users across the platform</p>
      </div>
      
      {loading ? (
        <div className="loading-indicator">
          <div className="post-card">
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-primary-color" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        </div>
      ) : posts.length > 0 ? (
        <div className="posts-list">
          {posts.map(post => (
            <Post 
              key={post.id} 
              post={post} 
              signer={signer} 
              account={account} 
            />
          ))}
        </div>
      ) : (
        <div className="post-card text-center py-8 fade-in">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <p className="text-gray-500">No posts yet on the platform</p>
          <p className="mt-2 text-gray-500">Be the first to create a post!</p>
        </div>
      )}
    </div>
  );
};

export default Explore; 