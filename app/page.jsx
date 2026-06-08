"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { SiOpenai, SiX } from "react-icons/si";

const STAGE_WIDTH = 1535;

const projects = [
  {
    icon: "🐣",
    label: "gender-reveal",
    description: "Find out our baby's gender!",
    href: "/gender-reveal",
  },
  {
    icon: "📋",
    label: "character-select",
    description: "A baby name chooser app",
    href: "/character-select",
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

function useStageScale(stageRef) {
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return undefined;
    }

    const updateScale = () => {
      setScale(stage.clientWidth / STAGE_WIDTH);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(stage);
    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [stageRef]);

  return scale;
}

function SocialLink({ href, label, Icon, className = "" }) {
  return (
    <a className={`logo-hotspot ${className}`} href={href} aria-label={label}>
      <Icon aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </a>
  );
}

function DesktopPrompt({ time, command }) {
  return (
    <div className="terminal-prompt">
      <p className="terminal-identity">
        <span>peterargany</span>
        <b>@</b>
        <em>~/workspace</em>
        <i aria-hidden="true">🐠</i>
      </p>
      <p className="terminal-command">
        [{time}] &gt; {command}
      </p>
    </div>
  );
}

function DesktopTerminal({ time }) {
  return (
    <div className="stage-coordinate-plane" aria-hidden={false}>
      <section className="desktop-terminal" aria-label="Projects terminal">
        <DesktopPrompt time={time} command="ls" />

        <div className="desktop-projects">
          {projects.map((project) => (
            <Link key={project.label} className="desktop-project" href={project.href}>
              <span className="desktop-project-icon" aria-hidden="true">
                {project.icon}
              </span>
              <span className="desktop-project-name">{project.label}</span>
              <span className="desktop-project-description">{project.description}</span>
            </Link>
          ))}
        </div>

        <DesktopPrompt time={time} command={<span className="terminal-cursor" />} />
      </section>
    </div>
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
        {projects.map((project) => {
          const content = (
            <>
              <span className="project-icon" aria-hidden="true">
                {project.icon}
              </span>
              <span>
                <strong>{project.label}</strong>
                <small>{project.description}</small>
              </span>
            </>
          );

          return (
            <Link key={project.label} className="phone-project" href={project.href}>
              {content}
            </Link>
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
  const stageRef = useRef(null);
  const stageScale = useStageScale(stageRef);

  return (
    <main className="studio-shell">
      <section
        ref={stageRef}
        className="scene-stage"
        style={{ "--stage-scale": stageScale }}
        aria-label="Peter Argany personal site"
      >
        <img
          className="scene-image"
          src="/pixel-studio-v3.png"
          alt="Pixel art desktop studio with Peter Argany's personal site in a terminal"
        />

        <DesktopTerminal time={clock.terminal} />

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

      </section>

      <MobileExperience clock={clock} />
    </main>
  );
}
