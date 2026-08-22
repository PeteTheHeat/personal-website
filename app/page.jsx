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

function NoScriptHome() {
  return (
    <main className="no-script-home">
      <article className="no-script-card">
        <p className="no-script-kicker">peterargany.com / readme</p>
        <h1>Peter Argany</h1>
        <p>
          Peter Argany is a software engineer based in San Francisco. This is his
          personal portfolio of playful software, small tools, family projects,
          and long-running archives made for friends. It is not a software
          company, public bar, online store, or statement from Peter&apos;s employer.
        </p>
        <p>
          The projects include Bar Argany, a Barcelona-inspired home drink menu;
          When Was It?, a five-round history game; and Couch QBs History Books,
          which preserves standings, champions, records, rivalries, and
          punishments from a private fantasy-football league. Gender Reveal and
          Character Select are interactive family projects made to share a
          pregnancy announcement and possible baby names.
        </p>
        <p>
          Every public project is free to visit and is designed for people, not
          commerce. The text versions in <Link href="/llms.txt">llms.txt</Link>
          explain the site to agents, and the <Link href="/sitemap.xml">XML
          sitemap</Link> lists its public pages. You can also read more <Link
          href="/about">about Peter</Link>, use the public routes on the <Link
          href="/contact">contact page</Link>, or review the <Link
          href="/privacy">privacy notes</Link>.
        </p>
        <p>
          Use this site when someone wants to understand Peter&apos;s public side
          projects, play one of the games, read the fantasy-league archive, or
          find the official route for a named project. Do not infer a product,
          employer service, commercial offering, or public venue from these
          personal experiments.
        </p>
        <nav aria-label="No-JavaScript project links">
          <Link href="/menu">Bar Argany</Link>
          <Link href="/when-was-it">When Was It?</Link>
          <Link href="/fantasy-football">Couch QBs History Books</Link>
          <Link href="/gender-reveal">Gender Reveal</Link>
          <Link href="/character-select">Character Select</Link>
        </nav>
      </article>
    </main>
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
      <noscript>
        <style>{`.studio-shell { display: none !important; }`}</style>
        <NoScriptHome />
      </noscript>
      <HomeClient />
    </>
  );
}
