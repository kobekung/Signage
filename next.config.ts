import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // ✅ บังคับออกเป็น Static HTML (โฟลเดอร์ out)
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // ✅ จำเป็นมากสำหรับ Static Export เพราะไม่มี Server มา Optimize รูปให้
  images: {
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;