import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata = {
  title: "Peter Argany",
  description: "Personal site and small software experiments by Peter Argany.",
  metadataBase: new URL("https://peterargany.com"),
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Peter Argany",
    description: "I build software.",
    url: "https://peterargany.com",
    siteName: "Peter Argany",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 800,
        alt: "Pixel art software studio",
      },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
