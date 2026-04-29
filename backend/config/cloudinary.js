const cloudinary = require("cloudinary").v2;

// Validate Cloudinary credentials before configuring
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Flag to track if Cloudinary is properly configured
let isCloudinaryConfigured = false;

// Check if credentials are missing or are placeholder values
const isValidCredentials = cloudName && apiKey && apiSecret && 
    cloudName !== 'your_cloud_name' && 
    apiKey !== 'your_api_key' && 
    apiSecret !== 'your_api_secret' &&
    cloudName !== '' && 
    apiKey !== '' && 
    apiSecret !== '';

if (!isValidCredentials) {
  console.error('❌ CLOUDINARY CONFIGURATION ERROR:');
  console.error('   Missing or invalid Cloudinary credentials in .env file');
  console.error('   Please update your backend/.env file with valid credentials:');
  console.error('   - CLOUDINARY_CLOUD_NAME');
  console.error('   - CLOUDINARY_API_KEY');
  console.error('   - CLOUDINARY_API_SECRET');
  console.error('   Get these from: https://cloudinary.com/users/sign_in');
  console.error('');
  console.error('   File uploads will be disabled until valid credentials are provided!');
  isCloudinaryConfigured = false;
} else {
  console.log('✅ Cloudinary credentials loaded successfully');
  console.log('   Cloud Name:', cloudName);
  isCloudinaryConfigured = true;
}

// Configure Cloudinary (even with invalid credentials to prevent crashes)
cloudinary.config({
  cloud_name: cloudName || 'demo',
  api_key: apiKey || 'demo',
  api_secret: apiSecret || 'demo',
  // Add timeout configuration
  timeout: 60000, // 60 seconds
});

/**
 * Check if Cloudinary is properly configured with valid credentials
 * @returns {boolean} - True if configured, false otherwise
 */
const isCloudinaryReady = () => {
  return isCloudinaryConfigured;
};

/**
 * Get Cloudinary configuration status with details
 * @returns {Object} - Configuration status object
 */
const getCloudinaryStatus = () => {
  return {
    configured: isCloudinaryConfigured,
    hasCloudName: !!cloudName && cloudName !== 'your_cloud_name' && cloudName !== '',
    hasApiKey: !!apiKey && apiKey !== 'your_api_key' && apiKey !== '',
    hasApiSecret: !!apiSecret && apiSecret !== 'your_api_secret' && apiSecret !== '',
    message: isCloudinaryConfigured 
      ? 'Cloudinary is ready' 
      : 'Cloudinary credentials are missing or invalid. Please update your .env file.'
  };
};

/**
 * Upload file to Cloudinary with validation check
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {Object} options - Upload options (folder, resource_type, etc.)
 * @returns {Promise<Object>} - Upload result or error
 */
const uploadToCloudinary = async (fileBuffer, options = {}) => {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured. Please provide valid API credentials in .env file.');
  }
  
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "rtcrs",
        resource_type: options.resource_type || "auto",
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const streamifier = require("streamifier");
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

module.exports = cloudinary;
module.exports.isCloudinaryReady = isCloudinaryReady;
module.exports.getCloudinaryStatus = getCloudinaryStatus;
module.exports.uploadToCloudinary = uploadToCloudinary;
