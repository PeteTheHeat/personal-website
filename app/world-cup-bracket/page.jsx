import Link from "next/link";

export const metadata = {
  title: "World Cup Bracket | Peter Argany",
};

export default function WorldCupBracket() {
  return (
    <main className="app-placeholder">
      <section>
        <p className="terminal-user">peterargany @ ~/apps</p>
        <h1>world-cup-bracket</h1>
        <p>
          This route is ready for a standalone app at
          peterargany.com/world-cup-bracket.
        </p>
        <Link href="/">Back home</Link>
      </section>
    </main>
  );
}
