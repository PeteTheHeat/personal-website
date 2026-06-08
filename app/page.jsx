"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { SiOpenai, SiX } from "react-icons/si";

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
    Icon: FaGithub,
    className: "github-hotspot",
  },
  {
    href: "https://www.linkedin.com/in/peterargany/",
    label: "LinkedIn",
    Icon: FaLinkedinIn,
    className: "linkedin-hotspot",
  },
  {
    href: "https://twitter.com/peterargany",
    label: "X",
    Icon: SiX,
    className: "x-hotspot",
  },
];

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatTerminalTime(date) {
  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    " ",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
    ":",
    pad(date.getSeconds()),
  ].join("");
}

function formatPhoneTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function useClock() {
  const [now, setNow] = useState(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return useMemo(
    () => ({
      terminal: now ? formatTerminalTime(now) : "---- -- -- --:--:--",
      phone: now ? formatPhoneTime(now) : "--:--",
    }),
    [now],
  );
}

function SocialLink({ href, label, Icon, className = "" }) {
  return (
    <a className={`logo-hotspot ${className}`} href={href} aria-label={label}>
      <Icon aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </a>
  );
}

function PhoneShell({ children }) {
  return (
    <div className="phone-shell" aria-label="Mobile personal site mock phone">
      <div className="phone-speaker" aria-hidden="true" />
      <div className="phone-screen">{children}</div>
      <div className="phone-controls" aria-hidden="true">
        <span className="call-key" />
        <span className="nav-key">
          <i />
        </span>
        <span className="end-key" />
        <span>1 ∞</span>
        <span>2 abc</span>
        <span>3 def</span>
        <span>4 ghi</span>
        <span>5 jkl</span>
        <span>6 mno</span>
      </div>
    </div>
  );
}

function PhoneStatus({ time }) {
  return (
    <div className="phone-status" aria-hidden="true">
      <span className="signal-bars">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>{time}</span>
      <span className="battery">
        <i />
      </span>
    </div>
  );
}

function MobileHomeScreen({ time, onOpenProjects }) {
  return (
    <PhoneShell>
      <PhoneStatus time={time} />
      <section className="phone-content phone-home">
        <img className="phone-portrait" src="/mobile-portrait.png" alt="" />
        <p className="phone-eyebrow">Hi! I'm</p>
        <h1>Peter</h1>
        <p className="phone-tagline">I build software.</p>

        <div className="phone-bio">
          <p>
            <span aria-hidden="true">🌎</span>
            <span>
              Based in
              <br />
              San Francisco, CA
            </span>
          </p>
          <p>
            <SiOpenai aria-hidden="true" />
            <span>
              Software Engineer
              <br />
              at OpenAI
            </span>
          </p>
        </div>

        <nav className="phone-socials" aria-label="Social links">
          {socialLinks.map(({ href, label, Icon }) => (
            <a key={href} href={href} aria-label={label}>
              <Icon aria-hidden="true" />
            </a>
          ))}
        </nav>
      </section>
      <button className="soft-key soft-key-projects" onClick={onOpenProjects}>
        Projects
      </button>
    </PhoneShell>
  );
}

function MobileProjectsScreen({ time, onBack }) {
  return (
    <PhoneShell>
      <PhoneStatus time={time} />
      <div className="phone-titlebar">
        <button onClick={onBack} aria-label="Back to home">
          ←
        </button>
        <span>~/workspace</span>
      </div>
      <section className="phone-project-list" aria-label="Projects">
        {activities.map((activity, index) => {
          const content = (
            <>
              <span className="project-icon" aria-hidden="true">
                {activity.icon}
              </span>
              <span>
                <strong>{activity.label}</strong>
                <small>{activity.description}</small>
              </span>
            </>
          );

          if (index === 0) {
            return (
              <Link key={activity.label} className="phone-project" href="/world-cup-bracket">
                {content}
              </Link>
            );
          }

          return (
            <div key={activity.label} className="phone-project">
              {content}
            </div>
          );
        })}
      </section>
      <button className="soft-key soft-key-back" onClick={onBack}>
        Back
      </button>
    </PhoneShell>
  );
}

function MobileExperience({ clock }) {
  const [screen, setScreen] = useState("home");

  return (
    <section className="mobile-stage" aria-label="Peter Argany mobile site">
      {screen === "home" ? (
        <MobileHomeScreen time={clock.phone} onOpenProjects={() => setScreen("projects")} />
      ) : (
        <MobileProjectsScreen time={clock.phone} onBack={() => setScreen("home")} />
      )}
    </section>
  );
}

export default function Home() {
  const clock = useClock();

  return (
    <main className="studio-shell">
      <section className="scene-stage" aria-label="Peter Argany personal site">
        <img
          className="scene-image"
          src="/pixel-studio-v2.png"
          alt="Pixel art desktop studio with Peter Argany's personal site in a terminal"
        />

        <span className="desktop-live-time desktop-live-time-top">
          [{clock.terminal}]
        </span>
        <span className="desktop-live-time desktop-live-time-bottom">
          [{clock.terminal}]
        </span>

        <nav className="social-hotspots" aria-label="Social links">
          {socialLinks.map(({ href, label, Icon, className }) => (
            <SocialLink
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              className={className}
            />
          ))}
        </nav>

        <Link
          className="terminal-route route-golf"
          href="/world-cup-bracket"
          aria-label="Open world cup bracket app"
        />
      </section>

      <MobileExperience clock={clock} />
    </main>
  );
}
