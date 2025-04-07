import axios from 'axios';

// Replace these with your actual Pinata API keys
const PINATA_API_KEY = '2b41e52720c932cfece8';
const PINATA_SECRET_API_KEY = '24c6bca362a72e941c714823fac96516d799eaa02bd485bd0d7d46545d427fcb';

const pinataEndpoint = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

/**
 * Upload a file to IPFS using Pinata
 * @param {File} file - The file object to upload
 * @returns {Promise<string>} - Returns the IPFS hash (CID) if successful
 */
export const uploadToPinata = async (file) => {
  if (!file) return null;
  
  try {
    // Create form data for the file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata about the file
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        app: 'SocialChain'
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Configure options like file limits
    const options = JSON.stringify({
      cidVersion: 0
    });
    formData.append('pinataOptions', options);
    
    // Send the request to Pinata
    const response = await axios.post(pinataEndpoint, formData, {
      maxBodyLength: 'Infinity', // This is needed for large files
      headers: {
        'Content-Type': `multipart/form-data;`,
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY
      }
    });
    
    // Return the IPFS hash (CID)
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw new Error('Failed to upload image to IPFS');
  }
};

/**
 * Get the IPFS gateway URL for a CID
 * @param {string} cid - The IPFS Content Identifier
 * @returns {string} - The gateway URL
 */
export const getIpfsGatewayUrl = (cid) => {
  if (!cid) return '';
  
  // You can use other gateways like Pinata's dedicated gateway if you have a subscription
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}; 