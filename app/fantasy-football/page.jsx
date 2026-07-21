import historyData from "../../lib/fantasy-history/data.generated.json";
import FantasyHistory from "./history-client";
import "./fantasy-football.css";

export const metadata = {
  title: "Couch QBs History Books | All-Time Fantasy Football Records",
  description:
    "All-time standings, champions, weekly records, season finishes, and head-to-head history for Couch QBs.",
  alternates: { canonical: "/fantasy-football" },
  openGraph: {
    title: "Couch QBs History Books",
    description: "All-time standings, champions, records, and rivalries.",
    url: "/fantasy-football",
    type: "website",
    images: [
      {
        url: "/fantasy-football/og-v3.png",
        width: 1200,
        height: 630,
        alt: "Couch QBs History Books",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Couch QBs History Books",
    description: "All-time standings, champions, records, and rivalries.",
    images: ["/fantasy-football/og-v3.png"],
  },
};

export default function FantasyFootballPage() {
  return <FantasyHistory data={historyData} />;
}
