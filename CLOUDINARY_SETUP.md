# ☁️ Cloudinary Setup Guide for CursedTicket

## 🚀 Quick Setup

### 1. Create Cloudinary Account
1. Go to [https://cloudinary.com/console](https://cloudinary.com/console)
2. Sign up for a free account
3. You'll get 25GB storage and 25GB bandwidth per month (free tier)

### 2. Get Your Credentials
After signing up, you'll see your dashboard with:
- **Cloud Name**: Your unique cloud identifier
- **API Key**: Your API key
- **API Secret**: Your secret key

### 3. Set Environment Variables
Create a `.env` file in your project root:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://salmon:1150@cluster0.wgl4v19.mongodb.net/Event?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=Event

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Upload Images
```bash
# Upload all images to Cloudinary
node scripts/uploadToCloudinary.js
```

### 5. Update Database
```bash
# Update database with Cloudinary URLs
node scripts/updateDatabaseWithCloudinary.js
```

## 🎯 Benefits of Cloudinary

### ✅ **Performance**
- **Global CDN**: Images load fast worldwide
- **Auto-optimization**: Automatic format and quality optimization
- **Responsive images**: Different sizes for different devices

### ✅ **Features**
- **Transformations**: Resize, crop, filter images on-the-fly
- **Format conversion**: Auto-convert to WebP, AVIF for better performance
- **Quality optimization**: Automatic quality adjustment

### ✅ **Reliability**
- **99.9% uptime**: Enterprise-grade reliability
- **Backup**: Automatic backup and versioning
- **Security**: Secure URLs and access control

## 📁 Image Organization

Your images will be organized in Cloudinary as:
```
cursed-ticket/
├── posters/
│   ├── cursed-ticket-poster-oppenheimer
│   ├── cursed-ticket-poster-dune
│   └── ...
└── wallpapers/
    ├── cursed-ticket-wallpaper-oppenheimer
    ├── cursed-ticket-wallpaper-dune
    └── ...
```

## 🔧 Advanced Features

### Image Transformations
```javascript
// Poster images (300x450, optimized for cards)
https://res.cloudinary.com/your-cloud/image/upload/w_300,h_450,c_fill,q_auto/f_auto/cursed-ticket/posters/dune

// Wallpaper images (1920x1080, optimized for backgrounds)
https://res.cloudinary.com/your-cloud/image/upload/w_1920,h_1080,c_fill,q_auto/f_auto/cursed-ticket/wallpapers/dune
```

### Dynamic Transformations
```javascript
// Get optimized URL for any size
const optimizedUrl = cloudinary.url('cursed-ticket/posters/dune', {
  width: 400,
  height: 600,
  crop: 'fill',
  quality: 'auto',
  format: 'auto'
});
```

## 💰 Pricing

### Free Tier (Perfect for Development)
- **25GB storage**
- **25GB bandwidth/month**
- **25,000 transformations/month**
- **Unlimited API calls**

### Paid Plans (For Production)
- **Starter**: $89/month for 100GB storage + 100GB bandwidth
- **Advanced**: $249/month for 500GB storage + 500GB bandwidth

## 🛠️ Troubleshooting

### Common Issues

1. **"Invalid credentials"**
   - Check your `.env` file
   - Verify Cloud Name, API Key, and API Secret

2. **"Upload failed"**
   - Check file paths in `scripts/uploadToCloudinary.js`
   - Ensure images exist in `public/images/`

3. **"Database update failed"**
   - Run upload script first
   - Check MongoDB connection

### Support
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Support](https://support.cloudinary.com/)

## 🎉 Next Steps

After setup:
1. ✅ Images will load faster worldwide
2. ✅ Automatic optimization for all devices
3. ✅ Better user experience
4. ✅ Scalable for production use

Your CursedTicket platform is now powered by Cloudinary! 🎭✨🎫
