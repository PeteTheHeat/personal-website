import Link from "next/link";

export default function InfoPage({ eyebrow, title, intro, children }) {
  return (
    <main className="info-shell">
      <article className="info-terminal">
        <header className="info-header">
          <p className="info-prompt">
            <span>peterargany</span>
            <b>@</b>
            <em>~/workspace</em>
            <i aria-hidden="true">🐠</i>
          </p>
          <p className="info-command">$ open {eyebrow}</p>
          <h1>{title}</h1>
          <p className="info-intro">{intro}</p>
        </header>

        <div className="info-content">{children}</div>

        <footer className="info-footer">
          <Link href="/">← Back to the studio</Link>
          <a href="/sitemap.xml">Sitemap</a>
        </footer>
      </article>
    </main>
  );
}
