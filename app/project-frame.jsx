import Link from "next/link";

export default function ProjectFrame({ src, title }) {
  return (
    <main className="project-frame-page">
      <Link className="project-frame-home" href="/">
        Home
      </Link>
      <iframe
        className="project-frame"
        src={src}
        title={title}
        allow="autoplay; fullscreen"
      />
    </main>
  );
}
