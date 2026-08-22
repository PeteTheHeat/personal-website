import { agentPages, markdownRouteKeys } from "../../../content/agent-pages";

export const dynamic = "force-static";

export function generateStaticParams() {
  return markdownRouteKeys.map((slug) => ({ slug }));
}

export async function GET(_request, { params }) {
  const { slug } = await params;
  const page = agentPages[slug];

  if (!page) {
    return new Response(
      "# Not found\n\nSee https://peterargany.com/sitemap.xml or https://peterargany.com/llms.txt.\n",
      {
        status: 404,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          Vary: "Accept, Accept-Encoding",
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );
  }

  return new Response(page.markdown, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=86400",
      "Content-Location": page.path,
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept, Accept-Encoding",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
