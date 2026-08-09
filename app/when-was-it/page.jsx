import { WhenWasItGame } from "../../projects/when-was-it/when-was-it-game";
import "../../projects/when-was-it/when-was-it.css";

const title = "When Was It? | Place five moments in history";
const description =
  "Five famous moments. Guess the year. Every year you miss adds one point.";
const canonicalUrl = "https://peterargany.com/when-was-it";
const socialImage = "https://peterargany.com/when-was-it/og.png";

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
        height: 630,
        alt: "When Was It? Place five moments in history.",
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

export default function WhenWasItPage() {
  return <WhenWasItGame />;
}
