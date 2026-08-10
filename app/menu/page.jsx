import BarArganyMenu from "../../projects/menu/menu";
import "../../projects/menu/menu.css";

const title = "Bar Argany | Home Drink Menu";
const description =
  "Cocktails, classics, and alcohol-free drinks at Bar Argany, a Barcelona-inspired home bar.";

export const metadata = {
  title,
  description,
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    type: "website",
    url: "/menu",
    title,
    description,
    siteName: "Peter Argany",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function MenuPage() {
  return <BarArganyMenu />;
}
