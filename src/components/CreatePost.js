import React, { useState, useRef, useEffect } from 'react';
import { createPost, getUserProfile } from '../utils/contractUtils';
import { uploadToPinata, getIpfsGatewayUrl } from '../utils/pinataService';

const CreatePost = ({ signer, onPostCreated, account }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const MAX_CHARS = 500;
  
  const textareaRef = useRef(null);
  const dropzoneRef = useRef(null);

  // Fetch user profile data including profile picture
  useEffect(() => {
    const fetchProfile = async () => {
      if (!signer || !account) return;
      
      setProfileLoading(true);
      try {
        const profileData = await getUserProfile(signer, account);
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchProfile();
  }, [signer, account]);

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Update character count
  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  // Focus textarea when expanded
  useEffect(() => {
    if (expanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [expanded]);

  // Handle textarea focus
  const handleFocus = () => {
    setExpanded(true);
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size too large (max 5MB)');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    
    setImage(file);
    setExpanded(true);
    
    // Create a preview URL for the selected image
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };
  
  // Clear the selected image
  const handleClearImage = () => {
    setImage(null);
    setImagePreview('');
    
    // Reset the file input
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size too large (max 5MB)');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      
      setImage(file);
      setExpanded(true);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !image) {
      setError('Please add some text or an image to your post');
      return;
    }
    
    if (content.length > MAX_CHARS) {
      setError(`Your post exceeds the maximum limit of ${MAX_CHARS} characters`);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let imageHash = '';
      
      // Upload image to IPFS if one is selected
      if (image) {
        setUploading(true);
        imageHash = await uploadToPinata(image);
        setUploading(false);
        
        if (!imageHash) {
          setError('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      // Create post with the image hash
      const success = await createPost(signer, content, imageHash);
      
      if (success) {
        setContent('');
        handleClearImage();
        setExpanded(false);
        if (onPostCreated) onPostCreated();
      } else {
        setError('Failed to create post. Please try again.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      
      // Handle the "Create a profile first" error specifically
      if (error.message && error.message.includes('Create a profile first')) {
        setError('You need to create a profile before posting. Go to the Profile tab to set up your profile.');
      } else {
        setError(`Error creating post: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        expanded &&
        !event.target.closest('.create-post-container') &&
        !loading &&
        !uploading &&
        content.trim().length === 0 &&
        !imagePreview
      ) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded, loading, uploading, content, imagePreview]);

  // Render user avatar based on profile data
  const renderAvatar = () => {
    if (profileLoading) {
      return (
        <div className="avatar-container shimmer">
          <div className="w-full h-full"></div>
        </div>
      );
    }

    if (profile && profile.profileImageHash) {
      return (
        <div className="avatar-container">
          <img 
            src={getIpfsGatewayUrl(profile.profileImageHash)} 
            alt={profile.username || "User"}
            onError={(e) => {
              // Fallback to initial if image fails to load
              e.target.style.display = 'none';
              e.target.parentNode.classList.add('avatar-fallback');
              e.target.parentNode.innerHTML = `
                <div class="w-full h-full flex items-center justify-center text-white">
                  <span class="font-bold">${profile.username ? profile.username.charAt(0).toUpperCase() : account.slice(2, 3).toUpperCase()}</span>
                </div>
              `;
            }}
          />
        </div>
      );
    }

    return (
      <div className="avatar-container">
        <div className="w-full h-full flex items-center justify-center text-white">
          <span className="font-bold">
            {profile && profile.username 
              ? profile.username.charAt(0).toUpperCase() 
              : (account ? account.slice(2, 3).toUpperCase() : 'U')}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`create-post fade-in ${expanded ? 'expanded' : ''}`} onDragEnter={handleDrag}>
      <div className="create-post-container">
        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="create-post-header">
            {renderAvatar()}
            <div className="create-post-input">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                className="create-post-textarea"
                disabled={loading || uploading}
                onFocus={handleFocus}
                rows={expanded ? 3 : 1}
              />
            </div>
          </div>
          
          {expanded && (
            <>
              {/* Image preview */}
              {imagePreview && (
                <div className="image-preview">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                  />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="remove-btn"
                    disabled={loading || uploading}
                    aria-label="Remove image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Drag and drop area */}
              {!imagePreview && (
                <div 
                  ref={dropzoneRef}
                  className={`image-dropzone ${dragActive ? 'active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 mb-2">Drag and drop your image here</p>
                  <p className="text-gray-400 text-sm">or</p>
                  <label className="inline-flex items-center px-4 py-2 mt-3 bg-primary text-white rounded-full cursor-pointer hover:bg-primary-dark transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" clipRule="evenodd" />
                      <path d="M4 12l4-4 2 2 4-4 4 4v4H4v-4z" />
                    </svg>
                    Browse files
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={loading || uploading}
                    />
                  </label>
                </div>
              )}
            
              <div className="create-post-footer">
                <div className="create-post-actions">
                  <div className="post-action-buttons">
                    <button 
                      type="button"
                      className="post-action-button"
                      disabled={loading || uploading || imagePreview !== ''}
                      onClick={() => document.getElementById('image-upload-button').click()}
                      aria-label="Add image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Image</span>
                      <input
                        type="file"
                        id="image-upload-button"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={loading || uploading}
                      />
                    </button>
                    
                    <button 
                      type="button"
                      className="post-action-button"
                      disabled={true}
                      aria-label="Add poll"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="hidden sm:inline">Poll</span>
                    </button>
                    
                    <button 
                      type="button"
                      className="post-action-button"
                      disabled={true}
                      aria-label="Add emoji"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="hidden sm:inline">Emoji</span>
                    </button>
                  </div>
                  
                  <div className="post-button-container">
                    {charCount > 0 && (
                      <div className={`char-counter ${charCount > MAX_CHARS ? 'text-danger' : ''}`}>
                        {charCount}/{MAX_CHARS}
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      className="post-button"
                      disabled={loading || uploading || (!content.trim() && !image) || charCount > MAX_CHARS}
                    >
                      {(loading || uploading) && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {uploading ? 'Uploading...' : loading ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
                
                {/* Upload status message */}
                {uploading && (
                  <p className="text-sm text-primary-color mt-2">Uploading image to IPFS...</p>
                )}
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreatePost; 