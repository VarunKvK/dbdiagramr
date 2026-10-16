/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // libpg-query ships Emscripten Node fallbacks (node:fs, node:crypto).
    // Strip the node: prefix in the browser bundle so they hit the empty
    // fallbacks below; those branches never execute outside Node.
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        })
      );
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: false,
        path: false,
      };
    }
    return config;
  },
  async rewrites() {
    return [
      // libpg-query (WASM) resolves its binary relative to the JS chunk URL
      // at runtime. Serve the vendored copy from /public instead.
      {
        source: "/_next/static/:path*/libpg-query.wasm",
        destination: "/libpg-query.wasm",
      },
    ];
  },
  async redirects() {
    return [
      // Removed landing pages (Oct 2026 revamp) — keep their equity.
      {
        source: "/supabase-schema-diagram",
        destination: "/schema/supabase",
        permanent: true,
      },
      {
        source: "/free-schema-generator",
        destination: "/postgres-er-diagram",
        permanent: true,
      },
      {
        source: "/database-diagram-online",
        destination: "/postgres-er-diagram",
        permanent: true,
      },
      {
        source: "/postgres-schema-visualizer",
        destination: "/postgres-er-diagram",
        permanent: true,
      },
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
