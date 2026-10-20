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
  experimental: {
    // Native addon: must be required at runtime, not bundled by webpack.
    serverComponentsExternalPackages: ["@resvg/resvg-js"],
    // Ship the font files with the OG image function.
    outputFileTracingIncludes: {
      "/api/og": ["./app/fonts/**"],
      "/schema/[slug]/diagram.png": ["./app/fonts/**"],
    },
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
        destination: "/supabase-er-diagram",
        permanent: true,
      },
      {
        source: "/postgres-er-diagram",
        destination: "/",
        permanent: true,
      },
      {
        source: "/blog/dbdiagram-tools-compared",
        destination: "/alternatives",
        permanent: true,
      },
      {
        source: "/blog/visualize-postgres-schema-5-ways",
        destination: "/blog/database-schema-diagram-tool",
        permanent: true,
      },
      {
        source: "/blog/django-auth-schema-explained",
        destination: "/schema/django",
        permanent: true,
      },
      {
        source: "/free-schema-generator",
        destination: "/",
        permanent: true,
      },
      {
        source: "/database-diagram-online",
        destination: "/",
        permanent: true,
      },
      {
        source: "/postgres-schema-visualizer",
        destination: "/",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "dbdiagramr.vercel.app" }],
        destination: "https://www.dbdiagramr.space/:path*",
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
