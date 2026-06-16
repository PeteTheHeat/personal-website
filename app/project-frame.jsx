export default function ProjectFrame({ src, title }) {
  return (
    <main className="project-frame-page">
      <iframe
        className="project-frame"
        src={src}
        title={title}
        allow="autoplay; fullscreen"
      />
    </main>
  );
}
