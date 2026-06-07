import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";

const activities = [
  {
    icon: "⛳",
    label: "golf",
    description: "Track rounds, stats, and improve your game.",
  },
  {
    icon: "🏋️",
    label: "weightlifting",
    description: "Log workouts and progress over time.",
  },
  {
    icon: "📖",
    label: "reading",
    description: "Track books, notes, and reading goals.",
  },
  {
    icon: "🌶️",
    label: "cooking",
    description: "Save recipes and plan your meals.",
  },
  {
    icon: "🍸",
    label: "cocktails",
    description: "Browse and save your favorite recipes.",
  },
];

const socialLinks = [
  {
    href: "https://github.com/PeteTheHeat",
    label: "GitHub",
    shortLabel: "GH",
  },
  {
    href: "https://www.linkedin.com/in/peterargany/",
    label: "LinkedIn",
    shortLabel: "in",
  },
  {
    href: "https://twitter.com/peterargany",
    label: "Twitter",
    shortLabel: "X",
  },
];

export default function Home() {
  return (
    <main className="studio-shell">
      <div className="studio-backdrop" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />

      <section className="hero-grid" aria-label="Peter Argany personal site">
        <aside className="intro-panel">
          <p className="eyebrow">Hi! I'm</p>
          <h1>Peter</h1>
          <p className="tagline">I build software.</p>

          <div className="bio-list">
            <p>
              <span className="bio-icon" aria-hidden="true">
                🌎
              </span>
              <span>
                Based in
                <br />
                San Francisco, CA
              </span>
            </p>
            <p>
              <span className="bio-icon openai-mark" aria-hidden="true">
                ✺
              </span>
              <span>
                Software Engineer
                <br />
                at OpenAI
              </span>
            </p>
          </div>

          <nav className="socials" aria-label="Social links">
            {socialLinks.map(({ href, label, shortLabel }) => (
              <a key={href} href={href} aria-label={label}>
                <span>{shortLabel}</span>
              </a>
            ))}
          </nav>
        </aside>

        <section className="monitor-wrap" aria-label="Terminal workspace">
          <div className="monitor-bezel">
            <div className="monitor-screen">
              <div className="terminal-glow" aria-hidden="true" />
              <div className="terminal-line prompt">
                <span className="terminal-user">peterargany</span>
                <span className="muted"> @ </span>
                <span className="terminal-path">~/workspace</span>
                <span className="fish" aria-hidden="true">
                  🐟
                </span>
              </div>
              <div className="terminal-line">
                <span className="timestamp">[2024-05-16 15:47:32]</span>
                <span className="command"> &gt; ls</span>
              </div>

              <div className="activity-list">
                {activities.map((item) => (
                  <div className="activity-row" key={item.label}>
                    <div className="activity-title">
                      <span aria-hidden="true">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>

              <div className="terminal-line prompt prompt-bottom">
                <span className="terminal-user">peterargany</span>
                <span className="muted"> @ </span>
                <span className="terminal-path">~/workspace</span>
                <span className="fish" aria-hidden="true">
                  🐟
                </span>
              </div>
              <div className="terminal-line">
                <span className="timestamp">[2024-05-16 15:47:32]</span>
                <span className="command"> &gt; </span>
                <span className="cursor" aria-hidden="true" />
              </div>
            </div>
            <div className="monitor-light" aria-hidden="true" />
          </div>
        </section>

        <aside className="side-console" aria-label="Project shortcuts">
          <div className="window-card">
            <span className="moon" aria-hidden="true">
              ◑
            </span>
            <div className="skyline" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="mini-device">
            <span>2026</span>
            <strong>BUILDING</strong>
            <strong>COOL</strong>
            <strong>THINGS</strong>
          </div>
          <Link className="app-link" href="/world-cup-bracket">
            <Sparkles size={16} />
            world-cup-bracket
          </Link>
          <p className="location-chip">
            <MapPin size={14} />
            peterargany.com
          </p>
        </aside>
      </section>
    </main>
  );
}
