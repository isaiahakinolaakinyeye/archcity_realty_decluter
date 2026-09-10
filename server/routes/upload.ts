import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

export const uploadRouter = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

/**
 * POST /api/upload
 * Body: { data: "data:image/jpeg;base64,..." }
 * Returns: { url: "https://res.cloudinary.com/..." }
 */
uploadRouter.post('/', async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Validate it looks like a base64 data URI
    if (!data.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format. Must be a base64 image data URI.' });
    }

    if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
      return res.status(500).json({ error: 'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file.' });
    }

    const result = await cloudinary.uploader.upload(data, {
      folder: 'archcity-inventory',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
      ],
    });

    return res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err: any) {
    console.error('[Upload] Cloudinary upload failed:', err.message);
    return res.status(500).json({ error: 'Image upload failed. Please try again.' });
  }
});
