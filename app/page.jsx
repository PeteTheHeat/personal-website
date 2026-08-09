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

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Peter Argany",
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
    "https://twitter.com/peterargany",
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HomeClient />
    </>
  );
}
