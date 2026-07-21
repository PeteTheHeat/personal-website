import historyData from "../../lib/fantasy-history/data.generated.json";
import FantasyHistory from "./history-client";
import "./fantasy-football.css";

export const metadata = {
  title: "Couch Quarterbacks | 13 Seasons of Fantasy Football History",
  description:
    "The all-time record book for Couch Quarterbacks: standings, champions, weekly records, and rivalries from 2013 through 2025.",
  alternates: { canonical: "/fantasy-football" },
  openGraph: {
    title: "Couch Quarterbacks | League Archive",
    description: "13 seasons. 17 managers. Every score. No excuses.",
    url: "/fantasy-football",
    type: "website",
    images: [
      {
        url: "/fantasy-football/og.png",
        width: 1200,
        height: 630,
        alt: "Couch Quarterbacks league archive, 13 seasons from 2013 to 2025",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Couch Quarterbacks | League Archive",
    description: "13 seasons. 17 managers. Every score. No excuses.",
    images: ["/fantasy-football/og.png"],
  },
};

export default function FantasyFootballPage() {
  return <FantasyHistory data={historyData} />;
}
