import React, { useState, useEffect, useCallback } from 'react';
import Post from './Post';
import CreatePost from './CreatePost';
import { getUserPosts } from '../utils/contractUtils';

const Feed = ({ account, signer, userAddress }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const targetAddress = userAddress || account;
  const isOwnFeed = !userAddress || userAddress === account;

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const fetchedPosts = await getUserPosts(signer, targetAddress);
    
    // Sort posts by timestamp (newest first)
    fetchedPosts.sort((a, b) => b.timestamp - a.timestamp);
    
    setPosts(fetchedPosts);
    setLoading(false);
  }, [signer, targetAddress]);

  useEffect(() => {
    if (signer && targetAddress) {
      loadPosts();
    }
  }, [signer, targetAddress, loadPosts]);

  return (
    <div className="feed">
      <h2 className="sr-only">Your Feed</h2>
      
      {isOwnFeed && account && signer && (
        <CreatePost 
          signer={signer} 
          account={account}
          onPostCreated={loadPosts} 
        />
      )}
      
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
        <div className="posts-list fade-in">
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
          <p className="text-gray-500">No posts yet</p>
          {isOwnFeed && (
            <p className="mt-2 text-gray-500">Create your first post to get started!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Feed; 