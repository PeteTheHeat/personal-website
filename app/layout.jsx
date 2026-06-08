import "./globals.css";

export const metadata = {
  title: "Peter Argany",
  description: "Personal site and small software experiments by Peter Argany.",
  metadataBase: new URL("https://peterargany.com"),
  openGraph: {
    title: "Peter Argany",
    description: "I build software.",
    url: "https://peterargany.com",
    siteName: "Peter Argany",
    images: [
      {
        url: "/pixel-studio-v2.png",
        width: 1536,
        height: 1024,
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
      <body>{children}</body>
    </html>
  );
}
