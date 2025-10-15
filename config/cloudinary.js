const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

// Upload options for different image types
const uploadOptions = {
  // Poster images (for homepage cards)
  poster: {
    folder: 'cursed-ticket/posters',
    transformation: [
      { width: 300, height: 450, crop: 'fill', quality: 'auto' }
    ],
    format: 'jpg'
  },
  
  // Wallpaper images (for detail page backgrounds)
  wallpaper: {
    folder: 'cursed-ticket/wallpapers',
    transformation: [
      { width: 1920, height: 1080, crop: 'fill', quality: 'auto' }
    ],
    format: 'jpg'
  }
};

// Function to upload image to Cloudinary
async function uploadImage(imagePath, type = 'poster') {
  try {
    const options = uploadOptions[type] || uploadOptions.poster;
    
    const result = await cloudinary.uploader.upload(imagePath, {
      ...options,
      public_id: `${Date.now()}_${type}`,
      overwrite: true
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      cloudId: result.public_id,
      publicUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

// Function to delete image from Cloudinary
async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

// Function to get optimized URL
function getOptimizedUrl(publicId, options = {}) {
  const defaultOptions = {
    quality: 'auto',
    format: 'auto'
  };
  
  return cloudinary.url(publicId, { ...defaultOptions, ...options });
}

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  getOptimizedUrl,
  uploadOptions
};
