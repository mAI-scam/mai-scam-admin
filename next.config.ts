import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com", // Allow Google profile images
      "mai-scam-detected-images.s3.amazonaws.com", // Allow S3 images
    ],
  },
};

export default nextConfig;
