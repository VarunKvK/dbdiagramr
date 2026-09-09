/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "dbdiagramr.space" }],
        destination: "https://www.dbdiagramr.space/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
