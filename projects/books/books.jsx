"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { FaGithub, FaLinkedinIn } from "react-icons/fa6";
import { SiX } from "react-icons/si";
import { booksByCategory } from "./books-data";

const STAGE_WIDTH = 1536;
const STAGE_HEIGHT = 1024;
const MOBILE_MEDIA_QUERY = "(max-width: 900px), (max-height: 639px)";

const categories = [
  { key: "fiction", label: "Fiction" },
  { key: "nonfiction", label: "Nonfiction" },
];

const socialLinks = [
  { href: "https://github.com/PeteTheHeat", label: "GitHub", Icon: FaGithub },
  {
    href: "https://www.linkedin.com/in/peterargany/",
    label: "LinkedIn",
    Icon: FaLinkedinIn,
  },
  { href: "https://x.com/peterargany", label: "X", Icon: SiX },
];

function PreloadBooksScenes() {
  preload("/pixel-studio-books.webp", {
    as: "image",
    type: "image/webp",
    media: `(min-width: 901px) and (min-height: 640px)`,
  });
  preload("/mobile-projects-bg-2.webp", {
    as: "image",
    type: "image/webp",
    media: MOBILE_MEDIA_QUERY,
  });

  return null;
}

function useStageGeometry(stageRef) {
  const [geometry, setGeometry] = useState({ scale: 1, x: 0, y: 0 });

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return undefined;
    }

    const updateGeometry = () => {
      const scale = Math.min(
        stage.clientWidth / STAGE_WIDTH,
        stage.clientHeight / STAGE_HEIGHT,
      );
      const width = STAGE_WIDTH * scale;
      const height = STAGE_HEIGHT * scale;

      setGeometry({
        scale,
        x: (stage.clientWidth - width) / 2,
        y: (stage.clientHeight - height) / 2,
      });
    };

    updateGeometry();
    const observer = new ResizeObserver(updateGeometry);
    observer.observe(stage);
    window.addEventListener("resize", updateGeometry);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateGeometry);
    };
  }, [stageRef]);

  return geometry;
}

function CategoryToggle({ activeCategory, onChange }) {
  return (
    <div className="books-category-toggle" role="group" aria-label="Book category">
      {categories.map(({ key, label }) => (
        <button
          type="button"
          key={key}
          aria-pressed={activeCategory === key}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function BookCard({ book }) {
  return (
    <li className="books-card">
      <a
        href={book.amazonUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${book.title} by ${book.author} on Amazon`}
      >
        <span className="books-cover-frame">
          <img
            src={book.cover}
            alt={`Pixel-art cover for ${book.title} by ${book.author}`}
            loading="eager"
            decoding="async"
          />
          <span className="books-cover-scanlines" aria-hidden="true" />
        </span>
        <strong>{book.title}</strong>
        <small>{book.author}</small>
      </a>
    </li>
  );
}

function Pagination({ page, pageCount, onPageChange }) {
  if (pageCount <= 1) {
    return <p className="books-page-count">1 / 1</p>;
  }

  return (
    <nav className="books-pagination" aria-label="Books pages">
      <button
        type="button"
        aria-label="Previous books"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        ←
      </button>
      <span aria-live="polite">
        {page + 1} / {pageCount}
      </span>
      <button
        type="button"
        aria-label="Next books"
        disabled={page === pageCount - 1}
        onClick={() => onPageChange(page + 1)}
      >
        →
      </button>
    </nav>
  );
}

function Bookshelf({
  perPage,
  variant,
  category,
  activeBookIndex,
  onCategoryChange,
  onBookIndexChange,
}) {
  const books = booksByCategory[category];
  const pageCount = Math.ceil(books.length / perPage);
  const page = Math.min(Math.floor(activeBookIndex / perPage), pageCount - 1);
  const visibleBooks = books.slice(page * perPage, page * perPage + perPage);

  return (
    <section
      className={`books-library books-library-${variant}`}
      aria-label={`Peter's favorite ${category} books`}
    >
      <p className="books-library-path">
        <span>peterargany</span> <b>@</b> <em>~/bookshelf</em>{" "}
        <i aria-hidden="true">📖</i>
      </p>
      <CategoryToggle activeCategory={category} onChange={onCategoryChange} />
      <ul className="books-grid" key={`${category}-${page}`}>
        {visibleBooks.map((book) => (
          <BookCard book={book} key={book.slug} />
        ))}
      </ul>
      <Pagination
        page={page}
        pageCount={pageCount}
        onPageChange={(nextPage) => onBookIndexChange(nextPage * perPage)}
      />
    </section>
  );
}

function SocialLinks({ className }) {
  return (
    <nav className={className} aria-label="Peter's profiles">
      {socialLinks.map(({ href, label, Icon }) => (
        <a href={href} aria-label={label} key={href}>
          <Icon aria-hidden="true" />
        </a>
      ))}
    </nav>
  );
}

function DesktopBooksScene({ stageRef, stageStyle, bookshelfProps }) {
  return (
    <section
      ref={stageRef}
      className="scene-stage books-desktop-stage"
      style={stageStyle}
      aria-label="Peter's favorite books in a pixel-art studio"
    >
      <div className="scene-backdrop books-scene-image" aria-hidden="true" />
      <div className="scene-image books-scene-image" aria-hidden="true" />

      <div className="stage-coordinate-plane books-coordinate-plane">
        <header className="books-left-panel">
          <p className="books-left-title" aria-hidden="true">
            <span>My favorite</span>
            <strong>books</strong>
          </p>
          <p className="books-left-tagline">Stories and ideas I keep coming back to.</p>
          <Link className="books-home-link" href="/">
            ← home
          </Link>
          <SocialLinks className="books-social-links" />
        </header>

        <Bookshelf perPage={6} variant="desktop" {...bookshelfProps} />
      </div>
    </section>
  );
}

function MobileBooksScene({ bookshelfProps }) {
  return (
    <section className="books-mobile-stage" aria-label="Peter's favorite books on mobile">
      <div className="books-mobile-scene">
        <div className="books-mobile-image" aria-hidden="true" />
        <Bookshelf perPage={4} variant="mobile" {...bookshelfProps} />
        <Link className="books-mobile-home" href="/">
          Home
        </Link>
      </div>
    </section>
  );
}

export default function BooksPageClient() {
  const stageRef = useRef(null);
  const [category, setCategory] = useState("fiction");
  const [activeBookIndex, setActiveBookIndex] = useState(0);
  const stageGeometry = useStageGeometry(stageRef);
  const stageStyle = {
    "--stage-scale": stageGeometry.scale,
    "--stage-x": `${stageGeometry.x}px`,
    "--stage-y": `${stageGeometry.y}px`,
  };
  const changeCategory = (nextCategory) => {
    setCategory(nextCategory);
    setActiveBookIndex(0);
  };
  const bookshelfProps = {
    category,
    activeBookIndex,
    onCategoryChange: changeCategory,
    onBookIndexChange: setActiveBookIndex,
  };

  return (
    <main className="studio-shell books-shell">
      <PreloadBooksScenes />
      <DesktopBooksScene
        stageRef={stageRef}
        stageStyle={stageStyle}
        bookshelfProps={bookshelfProps}
      />
      <MobileBooksScene bookshelfProps={bookshelfProps} />
    </main>
  );
}
