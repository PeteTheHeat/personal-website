import BooksPageClient from "../../projects/books/books";
import { allFavoriteBooks, booksByCategory } from "../../projects/books/books-data";
import "../../projects/books/bookshelf.css";

const canonicalUrl = "https://peterargany.com/books";
const title = "Favorite Books | Peter Argany";
const description =
  "Peter Argany's favorite fiction and nonfiction books, presented as a pixel-art bookshelf.";

export const metadata = {
  title,
  description,
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    type: "website",
    url: canonicalUrl,
    title,
    description,
    siteName: "Peter Argany",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 800,
        alt: "Peter Argany's pixel-art studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.jpg"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Peter Argany's favorite books",
  description,
  url: canonicalUrl,
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: allFavoriteBooks.length,
    itemListElement: allFavoriteBooks.map((book, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Book",
        name: book.title,
        author: {
          "@type": "Person",
          name: book.author,
        },
      },
    })),
  },
};

function BookList({ books }) {
  return (
    <ul>
      {books.map((book) => (
        <li key={book.slug}>
          <a href={book.amazonUrl}>{book.title}</a> by {book.author}
        </li>
      ))}
    </ul>
  );
}

function BooksContext() {
  return (
    <section className="sr-only" aria-labelledby="books-context-title">
      <h1 id="books-context-title">Peter Argany&apos;s favorite books</h1>
      <p>
        This bookshelf is a snapshot of the fiction and nonfiction books Peter has
        marked as favorites in his personal reading list. Choose a category and use
        the page controls to browse every title. Each book title opens Amazon.
      </p>
    </section>
  );
}

function NoScriptBooks() {
  return (
    <main className="no-script-home">
      <article className="no-script-card">
        <p className="no-script-kicker">peterargany.com / books</p>
        <h1>My favorite books</h1>
        <p>Stories and ideas I keep coming back to.</p>
        <h2>Fiction</h2>
        <BookList books={booksByCategory.fiction} />
        <h2>Nonfiction</h2>
        <BookList books={booksByCategory.nonfiction} />
        <nav aria-label="Books page navigation">
          <a href="/">← Back home</a>
        </nav>
      </article>
    </main>
  );
}

export default function BooksPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <BooksContext />
      <noscript>
        <style>{`
          html, body { overflow: auto !important; }
          .books-shell { display: none !important; }
        `}</style>
        <NoScriptBooks />
      </noscript>
      <BooksPageClient />
    </>
  );
}
