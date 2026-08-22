/** @type {import('next').NextConfig} */
const markdownVariants = [
  ["/", "home"],
  ["/menu", "menu"],
  ["/when-was-it", "when-was-it"],
  ["/fantasy-football", "fantasy-football"],
  ["/gender-reveal", "gender-reveal"],
  ["/character-select", "character-select"],
  ["/about", "about"],
  ["/contact", "contact"],
  ["/privacy", "privacy"],
  ["/sacko-tracker", "sacko-tracker"],
];

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
  async rewrites() {
    const acceptsMarkdown = [
      {
        type: "header",
        key: "accept",
        value: "(.*)text/markdown(.*)",
      },
    ];

    return {
      beforeFiles: markdownVariants.map(([source, slug]) => ({
        source,
        destination: `/agent-content/${slug}`,
        has: acceptsMarkdown,
      })),
      afterFiles: [],
      fallback: [
        {
          source: "/:path*",
          destination: "/agent-content/not-found",
          has: acceptsMarkdown,
        },
      ],
    };
  },
};

export default nextConfig;
