const nextConfig = {
  // Remove the experimental.appDir line - it's not needed in Next.js 14
  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
  },
  webpack: (config, { isServer }) => {
    // Handle leaflet's canvas dependency
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig