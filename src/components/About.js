import React from 'react';

const About = () => {
  return (
    <div className="about-container fade-in">
      <div className="post-card">
        <h2 className="about-title">About SocialChain</h2>
        
        <div className="about-section">
          <h3 className="about-section-title">What is SocialChain?</h3>
          <p>SocialChain is a decentralized social media platform built on the Ethereum blockchain (Sepolia testnet). It allows users to create profiles, share posts with text and images, like content, and follow other users—all secured by blockchain technology.</p>
        </div>
        
        <div className="about-section">
          <h3 className="about-section-title">Key Features</h3>
          <ul className="about-list">
            <li>Blockchain-based profiles and content</li>
            <li>Decentralized data storage with IPFS</li>
            <li>Secure authentication via Web3 wallets</li>
            <li>Post content with text and images</li>
            <li>Like and interact with posts</li>
            <li>Follow other users</li>
          </ul>
        </div>
        
        <div className="about-section">
          <h3 className="about-section-title">How It Works</h3>
          <p>SocialChain uses smart contracts to store your profile, posts, and social interactions. Content is stored on IPFS (InterPlanetary File System) for decentralized, censorship-resistant data storage.</p>
          <p>Each interaction (creating posts, liking, following) is recorded as a transaction on the Ethereum blockchain, ensuring transparency and data integrity.</p>
        </div>
        
        <div className="about-section">
          <h3 className="about-section-title">Getting Started</h3>
          <p>To use SocialChain, you need:</p>
          <ol className="about-list">
            <li>A Web3 wallet (like MetaMask)</li>
            <li>Some Sepolia testnet ETH for transactions</li>
            <li>Create your profile to start posting</li>
          </ol>
        </div>
        
        <div className="about-section">
          <h3 className="about-section-title">Technology Stack</h3>
          <div className="tech-stack">
            <div className="tech-item">
              <span className="tech-badge">Frontend</span>
              <p>React.js</p>
            </div>
            <div className="tech-item">
              <span className="tech-badge">Smart Contract</span>
              <p>Solidity</p>
            </div>
            <div className="tech-item">
              <span className="tech-badge">Storage</span>
              <p>IPFS / Pinata</p>
            </div>
            <div className="tech-item">
              <span className="tech-badge">Blockchain</span>
              <p>Ethereum (Sepolia)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 