import InfoPage from "../info-page";

const canonicalUrl = "https://peterargany.com/about";
const title = "About Peter Argany";
const description =
  "Peter Argany is a software engineer in San Francisco who builds playful software, personal tools, and projects for friends and family.";

export const metadata = {
  title,
  description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    type: "profile",
    url: canonicalUrl,
    title,
    description,
    siteName: "Peter Argany",
  },
  twitter: { card: "summary", title, description },
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="about.md"
      title="About Peter"
      intro="Software engineer. Practical tinkerer. Occasional keeper of very specific scoreboards."
    >
      <section>
        <h2>What I build</h2>
        <p>
          I&apos;m a software engineer based in San Francisco, currently working at
          OpenAI. This is my personal corner of the internet, where I keep the
          software that does not fit neatly into a product category: games for
          friends, family projects, useful little tools, and archives that preserve
          the history of a group.
        </p>
        <p>
          The common thread is practical playfulness. I like software that has a
          clear job, a point of view, and somebody real on the other side of it.
          Sometimes that means a history game. Sometimes it means thirteen seasons
          of fantasy-football records. Sometimes it means turning a family moment
          into something you can play.
        </p>
      </section>

      <section>
        <h2>What this site is</h2>
        <p>
          Peterargany.com is a personal portfolio, not a company or storefront.
          The projects here are public so friends, family, and curious visitors can
          use them. The site and its projects represent me personally; they do not
          speak for OpenAI or any other organization.
        </p>
      </section>
    </InfoPage>
  );
}
