export default function ProjectFrame({ src, title, description }) {
  return (
    <main className="project-frame-page">
      <div className="sr-only">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <iframe
        className="project-frame"
        src={src}
        title={title}
        allow="autoplay; fullscreen"
      />
    </main>
  );
}
