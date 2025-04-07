import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Profile from './components/Profile';
import Feed from './components/Feed';
import Explore from './components/Explore';
import About from './components/About';
import TrendingPosts from './components/TrendingPosts';
import SuggestedUsers from './components/SuggestedUsers';
import SidebarToggle from './components/SidebarToggle';
import { getUserProfile } from './utils/contractUtils';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if the user has created a profile
  useEffect(() => {
    const checkProfile = async () => {
      if (account && signer) {
        setLoading(true);
        try {
          const profile = await getUserProfile(signer, account);
          setHasProfile(profile && profile.username && profile.username.length > 0);
        } catch (error) {
          console.error('Error checking profile:', error);
          setHasProfile(false);
        } finally {
          setLoading(false);
        }
      }
    };

    checkProfile();
  }, [account, signer]);

  // Automatically redirect to profile tab if no profile exists
  useEffect(() => {
    if (account && signer && !hasProfile && !loading) {
      setActiveTab('profile');
    }
  }, [account, signer, hasProfile, loading]);

  // Close sidebar when clicking outside on small screens
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarOpen &&
        event.target.closest('.sidebar') === null &&
        event.target.closest('.sidebar-toggle') === null
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavLinkClick = (tab) => {
    setActiveTab(tab);
    // Close sidebar when navigating on small screens
    if (window.innerWidth <= 480) {
      setSidebarOpen(false);
    }
  };

  // Render the appropriate content based on the active tab
  const renderContent = () => {
    if (!hasProfile && activeTab !== 'profile' && activeTab !== 'about') {
      return (
        <>
          <div className="alert alert-warning fade-in">
            <p className="font-bold">Welcome to SocialChain!</p>
            <p>Please create a profile before you can start posting.</p>
          </div>
          <Profile 
            account={account} 
            signer={signer} 
            onProfileCreated={() => setHasProfile(true)}
          />
        </>
      );
    }

    switch (activeTab) {
      case 'feed':
        return <Feed account={account} signer={signer} />;
      case 'profile':
        return (
          <Profile 
            account={account} 
            signer={signer} 
            onProfileCreated={() => setHasProfile(true)}
          />
        );
      case 'explore':
        return <Explore account={account} signer={signer} />;
      case 'about':
        return <About />;
      default:
        return <Feed account={account} signer={signer} />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">SocialChain</div>
        <Header 
          account={account}
          setAccount={setAccount}
          setSigner={setSigner}
          signer={signer}
        />
      </header>

      {account && signer ? (
        <main className="main-layout">
          {/* Sidebar */}
          <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <nav>
              <div className="sidebar-section">
                <a 
                  href="#feed" 
                  className={`sidebar-link ${activeTab === 'feed' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); handleNavLinkClick('feed'); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <span className="sidebar-text">Home</span>
                </a>
                <a 
                  href="#profile" 
                  className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''} ${!hasProfile ? 'animate-pulse' : ''}`}
                  onClick={(e) => { e.preventDefault(); handleNavLinkClick('profile'); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="sidebar-text">Profile {!hasProfile && '(Create)'}</span>
                </a>
              </div>
              
              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Discover</h3>
                <a 
                  href="#explore" 
                  className={`sidebar-link ${activeTab === 'explore' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); handleNavLinkClick('explore'); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                  <span className="sidebar-text">Explore</span>
                </a>
              </div>
              
              <div className="sidebar-footer">
                <a 
                  href="#about"
                  className={`sidebar-link ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); handleNavLinkClick('about'); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span className="sidebar-text">About</span>
                </a>
              </div>
            </nav>
          </aside>

          {/* Sidebar toggle for small screens */}
          <SidebarToggle isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

          {/* Main content */}
          <div className="content-area">
            {renderContent()}
          </div>

          {/* Right sidebar for trends/suggestions */}
          <aside className="right-sidebar">
            <TrendingPosts signer={signer} />
            <SuggestedUsers signer={signer} account={account} />
          </aside>
        </main>
      ) : (
        <div className="content-area py-16 text-center">
          <div className="post-card fade-in">
            <h2 className="text-2xl font-bold mb-4">Welcome to SocialChain</h2>
            <p className="mb-8">A decentralized social media platform on the Ethereum blockchain</p>
            <p className="mb-6">Connect your wallet to get started</p>
          </div>
          
          {/* Features showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="post-card text-center py-6 px-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-lg font-bold mb-2">Decentralized Identity</h3>
              <p className="text-gray-600">Own your data with blockchain-based identity. No central authority controls your information.</p>
            </div>
            
            <div className="post-card text-center py-6 px-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <h3 className="text-lg font-bold mb-2">Censorship Resistant</h3>
              <p className="text-gray-600">Your posts can't be censored or deleted by a central authority. True freedom of expression.</p>
            </div>
            
            <div className="post-card text-center py-6 px-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-lg font-bold mb-2">IPFS Storage</h3>
              <p className="text-gray-600">All media stored on IPFS, ensuring your content is permanent and distributed across the network.</p>
            </div>
          </div>
          
          {/* Call to action */}
          <div className="post-card mt-8 py-8 px-4">
            <h2 className="text-xl font-bold mb-4">Ready to join the decentralized social revolution?</h2>
            <p className="mb-8">Connect your Ethereum wallet to start posting, following, and engaging with other users.</p>
            <div className="flex justify-center">
              <button className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg">
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
