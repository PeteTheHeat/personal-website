"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { SiX } from "react-icons/si";

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
  const [loadedAt, setLoadedAt] = useState(null);

  useEffect(() => {
    const tick = () => {
      const nextNow = new Date();
      setNow(nextNow);
      setLoadedAt((currentLoadedAt) => currentLoadedAt ?? nextNow);
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return useMemo(
    () => ({
      terminal: now ? formatTerminalTime(now) : "---- -- -- --:--:--",
      loadedTerminal: loadedAt ? formatTerminalTime(loadedAt) : "---- -- -- --:--:--",
      phone: now ? formatPhoneTime(now) : "--:--",
      loadedPhone: loadedAt ? formatPhoneTime(loadedAt) : "--:--",
    }),
    [loadedAt, now],
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

function DesktopTerminal({ loadedTime, liveTime }) {
  return (
    <div className="stage-coordinate-plane" aria-hidden={false}>
      <section className="desktop-terminal" aria-label="Projects terminal">
        <DesktopPrompt time={loadedTime} command="ls" />

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

        <DesktopPrompt time={liveTime} command={<span className="terminal-cursor" />} />
      </section>
    </div>
  );
}

function MobileScene({ variant, children }) {
  return (
    <div className={`mobile-scene mobile-scene-${variant}`}>
      <img
        className="mobile-scene-image"
        src={variant === "home" ? "/mobile-home-bg.png" : "/mobile-projects-bg.png"}
        alt=""
      />
      <div className="mobile-overlay">{children}</div>
    </div>
  );
}

function MobileSocialLink({ href, label, Icon }) {
  return (
    <a className="mobile-social-link" href={href} aria-label={label}>
      <Icon aria-hidden="true" />
    </a>
  );
}

function MobileHomeScreen({ time, onOpenProjects }) {
  return (
    <MobileScene variant="home">
      <time className="mobile-load-time">{time}</time>

      <nav className="mobile-socials" aria-label="Social links">
        {socialLinks.map(({ href, label, Icon }) => (
          <MobileSocialLink key={href} href={href} label={label} Icon={Icon} />
        ))}
      </nav>

      <button className="mobile-projects-button" onClick={onOpenProjects}>
        Projects
      </button>
    </MobileScene>
  );
}

function MobileProjectsScreen({ onBack }) {
  return (
    <MobileScene variant="projects">
      <button className="mobile-back-arrow" onClick={onBack} aria-label="Back to home">
        ←
      </button>

      <section className="mobile-projects-panel" aria-label="Projects">
        <span className="mobile-workspace" aria-hidden="true">
          ~/workspace
        </span>
        {projects.map((project) => {
          const content = (
            <>
              <span className="mobile-project-icon" aria-hidden="true">
                {project.icon}
              </span>
              <span>
                <strong>{project.label}</strong>
                <small>{project.description}</small>
              </span>
            </>
          );

          return (
            <Link key={project.label} className="mobile-project" href={project.href}>
              {content}
            </Link>
          );
        })}
      </section>

      <button className="mobile-back-button" onClick={onBack}>
        Back
      </button>
    </MobileScene>
  );
}

function MobileExperience({ clock }) {
  const [screen, setScreen] = useState("home");

  return (
    <section className="mobile-stage" aria-label="Peter Argany mobile site">
      {screen === "home" ? (
        <MobileHomeScreen
          time={clock.loadedPhone}
          onOpenProjects={() => setScreen("projects")}
        />
      ) : (
        <MobileProjectsScreen onBack={() => setScreen("home")} />
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

        <DesktopTerminal loadedTime={clock.loadedTerminal} liveTime={clock.terminal} />

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
