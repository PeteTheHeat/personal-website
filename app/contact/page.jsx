import InfoPage from "../info-page";

const canonicalUrl = "https://peterargany.com/contact";
const title = "Contact Peter Argany";
const description =
  "Public ways to contact Peter Argany about his personal website, projects, and source code.";

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

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="contact.md"
      title="Contact"
      intro="A few public doors, depending on what you want to talk about."
    >
      <section>
        <h2>Say hello</h2>
        <p>
          The best general route is my{" "}
          <a href="https://www.linkedin.com/in/peterargany/">LinkedIn profile</a>.
          Short, public conversation also works on{" "}
          <a href="https://x.com/peterargany">X</a>. If your question is about
          source code, a bug, or one of my public repositories, start with{" "}
          <a href="https://github.com/PeteTheHeat">GitHub</a> and use the relevant
          repository&apos;s issue tracker when one is available.
        </p>
      </section>

      <section>
        <h2>A useful boundary</h2>
        <p>
          This is a personal website, so it does not provide customer support,
          sales, recruiting, bar reservations, or support for OpenAI products. I
          also cannot safely help through a public profile with passwords,
          credentials, medical information, financial details, or other sensitive
          data. Please do not send those.
        </p>
        <p>
          For a correction to something published here, point me to the exact page
          and the detail that is wrong. Concrete reports are much easier to act on
          than a general note that something looks off.
        </p>
      </section>
    </InfoPage>
  );
}
