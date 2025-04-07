// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SocialChain {
    // Struct to represent a post
    struct Post {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        uint256 likesCount;
        string imageHash; // IPFS hash for image if any
    }

    // Struct to represent a user profile
    struct Profile {
        string username;
        string bio;
        string profileImageHash; // IPFS hash for profile picture
        uint256[] postIds;
        uint256 followersCount;
        uint256 followingCount;
    }

    // Mapping from user address to profile
    mapping(address => Profile) public profiles;
    
    // Mapping to track all posts
    mapping(uint256 => Post) public posts;
    
    // Track total number of posts
    uint256 public postCount;
    
    // Mapping to track if a user has liked a post
    mapping(address => mapping(uint256 => bool)) public postLikes;
    
    // Mapping to track follower relationships
    mapping(address => mapping(address => bool)) public isFollowing;

    // Events
    event ProfileCreated(address indexed user, string username);
    event PostCreated(uint256 postId, address indexed author, string content, uint256 timestamp);
    event PostLiked(uint256 postId, address indexed liker);
    event UserFollowed(address indexed follower, address indexed followed);

    // Create or update a profile
    function createProfile(string memory _username, string memory _bio, string memory _profileImageHash) public {
        Profile storage profile = profiles[msg.sender];
        profile.username = _username;
        profile.bio = _bio;
        profile.profileImageHash = _profileImageHash;
        
        emit ProfileCreated(msg.sender, _username);
    }

    // Create a new post
    function createPost(string memory _content, string memory _imageHash) public {
        require(bytes(profiles[msg.sender].username).length > 0, "Create a profile first");
        
        postCount++;
        
        Post storage post = posts[postCount];
        post.id = postCount;
        post.author = msg.sender;
        post.content = _content;
        post.timestamp = block.timestamp;
        post.imageHash = _imageHash;
        
        // Add post ID to user's posts
        profiles[msg.sender].postIds.push(postCount);
        
        emit PostCreated(postCount, msg.sender, _content, block.timestamp);
    }

    // Like a post
    function likePost(uint256 _postId) public {
        require(_postId > 0 && _postId <= postCount, "Invalid post ID");
        require(!postLikes[msg.sender][_postId], "Already liked this post");
        
        postLikes[msg.sender][_postId] = true;
        posts[_postId].likesCount++;
        
        emit PostLiked(_postId, msg.sender);
    }

    // Follow a user
    function followUser(address _userToFollow) public {
        require(_userToFollow != msg.sender, "Cannot follow yourself");
        require(bytes(profiles[_userToFollow].username).length > 0, "User to follow does not exist");
        require(!isFollowing[msg.sender][_userToFollow], "Already following this user");
        
        isFollowing[msg.sender][_userToFollow] = true;
        profiles[msg.sender].followingCount++;
        profiles[_userToFollow].followersCount++;
        
        emit UserFollowed(msg.sender, _userToFollow);
    }

    // Get posts created by a specific user
    function getUserPosts(address _user) public view returns (uint256[] memory) {
        return profiles[_user].postIds;
    }

    // Get details of a specific post
    function getPost(uint256 _postId) public view returns (
        uint256 id,
        address author,
        string memory content,
        uint256 timestamp,
        uint256 likesCount,
        string memory imageHash
    ) {
        Post memory post = posts[_postId];
        return (
            post.id,
            post.author,
            post.content,
            post.timestamp,
            post.likesCount,
            post.imageHash
        );
    }

    // Get user profile
    function getProfile(address _user) public view returns (
        string memory username,
        string memory bio,
        string memory profileImageHash,
        uint256 followersCount,
        uint256 followingCount
    ) {
        Profile memory profile = profiles[_user];
        return (
            profile.username,
            profile.bio,
            profile.profileImageHash,
            profile.followersCount,
            profile.followingCount
        );
    }
} 