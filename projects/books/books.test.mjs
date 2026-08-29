import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

import { allFavoriteBooks, booksByCategory } from "./books-data.js";

const publicRoot = new URL("../../public/", import.meta.url);

test("publishes every five-heart Notion favorite in its category", () => {
  assert.equal(booksByCategory.fiction.length, 9);
  assert.equal(booksByCategory.nonfiction.length, 17);
  assert.equal(allFavoriteBooks.length, 26);

  for (const [category, books] of Object.entries(booksByCategory)) {
    assert.ok(books.length > 0, `${category} must not be empty`);
    assert.ok(books.every((book) => book.title && book.author));
  }
});

test("uses unique slugs, links, and local cover paths", async () => {
  const slugs = new Set();
  const links = new Set();

  for (const book of allFavoriteBooks) {
    assert.ok(!slugs.has(book.slug), `Duplicate slug: ${book.slug}`);
    assert.ok(!links.has(book.amazonUrl), `Duplicate Amazon link: ${book.amazonUrl}`);
    slugs.add(book.slug);
    links.add(book.amazonUrl);

    const amazonUrl = new URL(book.amazonUrl);
    assert.equal(amazonUrl.protocol, "https:");
    assert.equal(amazonUrl.hostname, "www.amazon.com");
    assert.equal(amazonUrl.pathname, "/s");
    assert.equal(amazonUrl.searchParams.get("i"), "stripbooks");
    assert.match(amazonUrl.searchParams.get("k") ?? "", new RegExp(book.author, "i"));

    assert.match(book.cover, /^\/books\/covers\/[a-z0-9-]+\.webp$/);
    await access(new URL(`.${book.cover}`, publicRoot));
  }
});

test("links the favorite bookshelf from every homepage experience", async () => {
  const [clientSource, pageSource] = await Promise.all([
    readFile(new URL("../../app/home-client.jsx", import.meta.url), "utf8"),
    readFile(new URL("../../app/page.jsx", import.meta.url), "utf8"),
  ]);

  assert.match(clientSource, /icon: "📚"/);
  assert.match(clientSource, /label: "books"/);
  assert.match(clientSource, /description: "My favorite books"/);
  assert.match(clientSource, /href: "\/books"/);
  assert.match(pageSource, /<Link href="\/books">Favorite Books<\/Link>/);
});
