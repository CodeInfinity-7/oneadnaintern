/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://oneadnaintern.onrender.com/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
