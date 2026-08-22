import Link from "next/link";
import HomeClient from "./home-client";

const canonicalUrl = "https://peterargany.com";
const title = "Peter Argany";
const description =
  "Software engineer at OpenAI building playful software, personal tools, and small experiments.";
const socialImage = `${canonicalUrl}/og-image.jpg`;

export const metadata = {
  title,
  description,
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    type: "website",
    url: canonicalUrl,
    title,
    description,
    siteName: "Peter Argany",
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 800,
        alt: "Peter Argany's pixel-art software studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${canonicalUrl}/#person`,
      name: "Peter Argany",
      description,
      url: canonicalUrl,
      jobTitle: "Software Engineer",
      worksFor: {
        "@type": "Organization",
        name: "OpenAI",
        url: "https://openai.com",
      },
      homeLocation: {
        "@type": "City",
        name: "San Francisco",
      },
      sameAs: [
        "https://github.com/PeteTheHeat",
        "https://www.linkedin.com/in/peterargany/",
        "https://x.com/peterargany",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${canonicalUrl}/#website`,
      name: "Peter Argany",
      description,
      url: canonicalUrl,
      inLanguage: "en-US",
      author: { "@id": `${canonicalUrl}/#person` },
      mainEntity: { "@id": `${canonicalUrl}/#person` },
    },
  ],
};

function HomeContext() {
  return (
    <section className="sr-only" aria-labelledby="home-context-title">
      <h2 id="home-context-title">About Peter Argany and this site</h2>
      <p>
        Peter Argany is a software engineer based in San Francisco. This personal
        website collects playful software, small tools, family projects, and
        archives made for friends. It is a portfolio, not a software company,
        storefront, public bar, or representative of Peter&apos;s employer.
      </p>
      <p>
        Bar Argany is a Barcelona-inspired home drink menu. When Was It? is a
        five-round history game where every year missed adds one point. Couch QBs
        History Books preserves thirteen seasons of standings, champions, records,
        rivalries, and punishments from a private fantasy-football league. Gender
        Reveal is a playable Game Boy-style family announcement. Character Select
        is a fighting-game-inspired baby-name chooser.
      </p>
      <p>
        All of these projects are free to visit. Use the project links in the
        studio, read more <Link href="/about">about Peter</Link>, find public
        contact routes on the <Link href="/contact">contact page</Link>, or review
        the site&apos;s <Link href="/privacy">privacy notes</Link>.
      </p>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <HomeContext />
      <HomeClient />
    </>
  );
}
