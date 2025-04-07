import { ethers } from 'ethers';

// Contract ABI - This will be filled after deployment
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_content",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_imageHash",
				"type": "string"
			}
		],
		"name": "createPost",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_username",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_bio",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_profileImageHash",
				"type": "string"
			}
		],
		"name": "createProfile",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_userToFollow",
				"type": "address"
			}
		],
		"name": "followUser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_postId",
				"type": "uint256"
			}
		],
		"name": "likePost",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "postId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "author",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "content",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "PostCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "postId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "liker",
				"type": "address"
			}
		],
		"name": "PostLiked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "username",
				"type": "string"
			}
		],
		"name": "ProfileCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "follower",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "followed",
				"type": "address"
			}
		],
		"name": "UserFollowed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_postId",
				"type": "uint256"
			}
		],
		"name": "getPost",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "author",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "content",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "likesCount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "imageHash",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getProfile",
		"outputs": [
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "bio",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "profileImageHash",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "followersCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "followingCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getUserPosts",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "isFollowing",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "postCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "postLikes",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "posts",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "author",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "content",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "likesCount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "imageHash",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "profiles",
		"outputs": [
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "bio",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "profileImageHash",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "followersCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "followingCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Contract address - This will be filled after deployment
const CONTRACT_ADDRESS = '0xe6b2ab967abe3ee9a6b5b3024388e86a5efad569';

// Network configuration for Sepolia testnet
const NETWORK_CONFIG = {
  chainId: '0xaa36a7', // Sepolia chain ID in hex
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/']
};

// Function to connect to MetaMask
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this app');
      return null;
    }

    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Check if we're on the right network
    await switchToSepoliaNetwork();
    
    // Get provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    return { 
      address: accounts[0],
      signer 
    };
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    return null;
  }
};

// Function to switch to Sepolia network
export const switchToSepoliaNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORK_CONFIG.chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK_CONFIG],
        });
      } catch (addError) {
        console.error('Error adding Sepolia network:', addError);
      }
    } else {
      console.error('Error switching to Sepolia network:', switchError);
    }
  }
};

// Function to get contract instance
export const getContractInstance = (signer) => {
  if (!CONTRACT_ADDRESS) {
    console.error('Contract address not set');
    return null;
  }

  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

// Contract interaction functions
export const createProfile = async (signer, username, bio, profileImageHash) => {
  const contract = getContractInstance(signer);
  if (!contract) return null;
  
  try {
    const tx = await contract.createProfile(username, bio, profileImageHash);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error creating profile:', error);
    return false;
  }
};

export const createPost = async (signer, content, imageHash = '') => {
  const contract = getContractInstance(signer);
  if (!contract) return null;
  
  try {
    const tx = await contract.createPost(content, imageHash);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error creating post:', error);
    return false;
  }
};

export const likePost = async (signer, postId) => {
  const contract = getContractInstance(signer);
  if (!contract) return null;
  
  try {
    const tx = await contract.likePost(postId);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error liking post:', error);
    return false;
  }
};

export const followUser = async (signer, userAddress) => {
  const contract = getContractInstance(signer);
  if (!contract) return null;
  
  try {
    const tx = await contract.followUser(userAddress);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error following user:', error);
    return false;
  }
};

export const getUserProfile = async (signer, userAddress) => {
  const contract = getContractInstance(signer);
  if (!contract) return null;
  
  try {
    const profile = await contract.getProfile(userAddress);
    return {
      username: profile[0],
      bio: profile[1],
      profileImageHash: profile[2],
      followersCount: profile[3].toNumber(),
      followingCount: profile[4].toNumber()
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const getUserPosts = async (signer, userAddress) => {
  const contract = getContractInstance(signer);
  if (!contract) return null;
  
  try {
    const postIds = await contract.getUserPosts(userAddress);
    const posts = [];
    
    for (let i = 0; i < postIds.length; i++) {
      const postId = postIds[i].toNumber();
      const post = await contract.getPost(postId);
      posts.push({
        id: post[0].toNumber(),
        author: post[1],
        content: post[2],
        timestamp: new Date(post[3].toNumber() * 1000),
        likesCount: post[4].toNumber(),
        imageHash: post[5]
      });
    }
    
    return posts;
  } catch (error) {
    console.error('Error getting user posts:', error);
    return [];
  }
};

export const getPostById = async (signer, postId) => {
  const contract = getContractInstance(signer);
  if (!contract) return null;
  
  try {
    const post = await contract.getPost(postId);
    return {
      id: post[0].toNumber(),
      author: post[1],
      content: post[2],
      timestamp: new Date(post[3].toNumber() * 1000),
      likesCount: post[4].toNumber(),
      imageHash: post[5]
    };
  } catch (error) {
    console.error('Error getting post:', error);
    return null;
  }
};

export const hasUserLikedPost = async (signer, postId, userAddress) => {
  const contract = getContractInstance(signer);
  if (!contract || !userAddress) return false;
  
  try {
    const hasLiked = await contract.postLikes(userAddress, postId);
    return hasLiked;
  } catch (error) {
    console.error('Error checking if user liked post:', error);
    return false;
  }
};

// Get all posts
export const getAllPosts = async (signer, limit = 100) => {
  const contract = getContractInstance(signer);
  if (!contract) return [];
  
  try {
    const postCountBN = await contract.postCount();
    const postCount = postCountBN.toNumber();
    const posts = [];
    
    // Start from the most recent post and go backwards
    const startIndex = Math.max(1, postCount - limit + 1);
    
    for (let i = postCount; i >= startIndex; i--) {
      try {
        const post = await contract.getPost(i);
        posts.push({
          id: post[0].toNumber(),
          author: post[1],
          content: post[2],
          timestamp: new Date(post[3].toNumber() * 1000),
          likesCount: post[4].toNumber(),
          imageHash: post[5]
        });
      } catch (error) {
        console.error(`Error fetching post ${i}:`, error);
      }
    }
    
    return posts;
  } catch (error) {
    console.error('Error getting all posts:', error);
    return [];
  }
};

// Get trending posts sorted by likes count
export const getTrendingPosts = async (signer, limit = 5) => {
  try {
    const allPosts = await getAllPosts(signer);
    
    // Sort by likes count (highest first)
    const sortedPosts = [...allPosts].sort((a, b) => b.likesCount - a.likesCount);
    
    // Return the top posts
    return sortedPosts.slice(0, limit);
  } catch (error) {
    console.error('Error getting trending posts:', error);
    return [];
  }
}; 