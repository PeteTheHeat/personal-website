import InfoPage from "../info-page";

const canonicalUrl = "https://peterargany.com/privacy";
const title = "Privacy | Peter Argany";
const description =
  "How peterargany.com uses analytics and handles information submitted to its interactive projects.";

export const metadata = {
  title,
  description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    type: "website",
    url: canonicalUrl,
    title,
    description,
    siteName: "Peter Argany",
  },
  twitter: { card: "summary", title, description },
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="privacy.md"
      title="Privacy"
      intro="A plain-language map of what this small personal site measures and stores."
    >
      <section>
        <h2>Site analytics</h2>
        <p>
          Peterargany.com uses Vercel Web Analytics and Speed Insights to understand
          aggregate visits and site performance. Vercel receives the technical data
          necessary to provide those services. Its handling of that information is
          governed by the{" "}
          <a href="https://vercel.com/legal/privacy-policy">Vercel Privacy Policy</a>.
        </p>
      </section>

      <section>
        <h2>Interactive projects</h2>
        <p>
          Most projects require no account. Some may keep progress or preferences
          in your browser. If you choose to submit a When Was It? leaderboard
          result, the site stores the display name you enter, the verified score,
          and a random submission identifier used to prevent duplicate writes. The
          public leaderboard shows the qualifying name and score.
        </p>
        <p>
          The Sacko Tracker has a private administration route. Authorized access
          uses a secure session cookie, and repeated login attempts may be checked
          by network address to reduce abuse. Public visitors do not need that
          cookie to view the tracker.
        </p>
      </section>

      <section>
        <h2>What not to submit</h2>
        <p>
          Public game fields are not designed for sensitive information. Do not use
          them for passwords, contact details, medical information, financial
          information, or private identifiers. If you have a privacy question or
          want a leaderboard entry reviewed, use one of the public routes on the{" "}
          <a href="/contact">contact page</a> and identify the exact project.
        </p>
      </section>
    </InfoPage>
  );
}
