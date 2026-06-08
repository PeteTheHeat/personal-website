import Link from "next/link";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { SiOpenai, SiX } from "react-icons/si";

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

export default function Home() {
  return (
    <main className="studio-shell">
      <section className="scene-stage" aria-label="Peter Argany personal site">
        <img
          className="scene-image"
          src="/pixel-studio-reference.png"
          alt="Pixel art desktop studio with Peter Argany's personal site in a terminal"
        />

        <a
          className="openai-hotspot"
          href="https://openai.com"
          aria-label="OpenAI"
        >
          <SiOpenai />
        </a>

        <nav className="social-hotspots" aria-label="Social links">
          {socialLinks.map(({ href, label, Icon, className }) => (
            <a key={href} className={`logo-hotspot ${className}`} href={href}>
              <Icon aria-hidden="true" />
              <span className="sr-only">{label}</span>
            </a>
          ))}
        </nav>

        <Link
          className="terminal-route route-golf"
          href="/world-cup-bracket"
          aria-label="Open world cup bracket app"
        />
      </section>
    </main>
  );
}
