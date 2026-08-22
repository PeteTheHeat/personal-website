import Link from "next/link";

const projectLinks = [
  ["/menu", "bar-argany"],
  ["/when-was-it", "when-was-it"],
  ["/fantasy-football", "fantasy-football"],
  ["/gender-reveal", "gender-reveal"],
  ["/character-select", "character-select"],
];

export default function NotFound() {
  return (
    <main className="not-found-shell">
      <div className="not-found-scene" aria-hidden="true" />

      <section className="not-found-monitor" aria-labelledby="not-found-title">
        <div className="not-found-titlebar">
          <span aria-hidden="true">● ● ●</span>
          <span>peterargany — zsh — 404</span>
        </div>

        <div className="not-found-screen">
          <p className="not-found-prompt">
            <span>peterargany</span>
            <b>@</b>
            <em>~/workspace</em>
            <i aria-hidden="true">🐠</i>
          </p>
          <p className="not-found-command">$ find ./page</p>
          <p className="not-found-error">find: ./page: No such file or directory</p>

          <div className="not-found-message">
            <p className="not-found-code">404</p>
            <h1 id="not-found-title">That page wandered off.</h1>
            <p>
              The route is missing, but the studio is still online. Start over or
              jump straight to a project.
            </p>
          </div>

          <nav className="not-found-actions" aria-label="404 recovery links">
            <Link className="not-found-home" href="/">
              cd /home
            </Link>
            {projectLinks.map(([href, label]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>

          <p className="not-found-map">
            Need the full map? <a href="/sitemap.xml">sitemap.xml</a>
            <span aria-hidden="true"> · </span>
            <a href="/llms.txt">llms.txt</a>
          </p>
        </div>
      </section>
    </main>
  );
}
