import Link from "next/link";

export const metadata = {
  title: "Character Select | Peter Argany",
};

export default function CharacterSelect() {
  return (
    <main className="app-placeholder">
      <section>
        <p className="terminal-user">peterargany @ ~/apps</p>
        <h1>character-select</h1>
        <p>
          This route is ready for a standalone app at
          peterargany.com/character-select.
        </p>
        <Link href="/">Back home</Link>
      </section>
    </main>
  );
}
