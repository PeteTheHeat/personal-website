import ProjectFrame from "../project-frame";

const title = "Character Select | Peter Argany";
const description =
  "A fighting-game-inspired baby name chooser for building your family roster.";
const canonicalUrl = "https://peterargany.com/character-select";
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

export default function CharacterSelect() {
  return (
    <ProjectFrame
      src="/projects/character-select/index.html"
      title="Character Select"
      description={description}
    />
  );
}
