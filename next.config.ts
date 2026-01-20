import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com", 
      "nsjrzxbtxsqmsdgevszv.supabase.co",
      "images.unsplash.com", // Added for placeholder images
      "cdn.filestackcontent.com", // humanitix event thumbnails
    ],
  },
};

export default nextConfig;
