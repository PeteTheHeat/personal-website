import Link from "next/link";

export const metadata = {
  title: "Gender Reveal | Peter Argany",
};

export default function GenderReveal() {
  return (
    <main className="app-placeholder">
      <section>
        <p className="terminal-user">peterargany @ ~/apps</p>
        <h1>gender-reveal</h1>
        <p>
          This route is ready for a standalone app at peterargany.com/gender-reveal.
        </p>
        <Link href="/">Back home</Link>
      </section>
    </main>
  );
}
