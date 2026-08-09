/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.peterargany.com",
          },
        ],
        destination: "https://peterargany.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    const noIndexHeaders = [
      {
        key: "X-Robots-Tag",
        value: "noindex, nofollow",
      },
    ];

    return [
      {
        source: "/api/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/projects/:path*",
        headers: noIndexHeaders,
      },
    ];
  },
};

export default nextConfig;
