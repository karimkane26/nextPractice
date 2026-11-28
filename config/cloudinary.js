import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary (hébergement des images des annonces)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
