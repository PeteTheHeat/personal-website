import ProjectFrame from "../project-frame";

const title = "Gender Reveal | Peter Argany";
const description =
  "A playable Game Boy-style pregnancy announcement built for the Argany family.";
const canonicalUrl = "https://peterargany.com/gender-reveal";
const socialImage = "https://peterargany.com/og-image.jpg";

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

export default function GenderReveal() {
  return (
    <ProjectFrame
      src="/projects/gender-reveal/index.html"
      title="Gender Reveal"
      description={description}
    />
  );
}
