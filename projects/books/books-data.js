const amazonBooksSearch = (title, author) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(`${title} ${author}`)}&i=stripbooks`;

function book(slug, title, author) {
  return Object.freeze({
    slug,
    title,
    author,
    cover: `/books/covers/${slug}.webp`,
    amazonUrl: amazonBooksSearch(title, author),
  });
}

// Snapshot of the five-heart views in Peter's Notion Reading List on 2026-08-24.
export const booksByCategory = Object.freeze({
  fiction: Object.freeze([
    book("project-hail-mary", "Project Hail Mary", "Andy Weir"),
    book("enders-game", "Ender's Game", "Orson Scott Card"),
    book("1984", "1984", "George Orwell"),
    book("ready-player-one", "Ready Player One", "Ernest Cline"),
    book("anthem", "Anthem", "Ayn Rand"),
    book("brave-new-world", "Brave New World", "Aldous Huxley"),
    book("the-guest-list", "The Guest List", "Lucy Foley"),
    book(
      "do-androids-dream-of-electric-sheep",
      "Do Androids Dream of Electric Sheep?",
      "Philip K. Dick",
    ),
    book("red-rising", "Red Rising", "Pierce Brown"),
  ]),
  nonfiction: Object.freeze([
    book(
      "how-to-fail-at-almost-everything",
      "How to Fail at Almost Everything and Still Win Big",
      "Scott Adams",
    ),
    book("salt-fat-acid-heat", "Salt, Fat, Acid, Heat", "Samin Nosrat"),
    book(
      "influence",
      "Influence: The Psychology of Persuasion",
      "Robert B. Cialdini",
    ),
    book("american-kingpin", "American Kingpin", "Nick Bilton"),
    book("storyworthy", "Storyworthy", "Matthew Dicks"),
    book("thinking-in-bets", "Thinking in Bets", "Annie Duke"),
    book("living-with-a-seal", "Living with a SEAL", "Jesse Itzler"),
    book("the-psychology-of-money", "The Psychology of Money", "Morgan Housel"),
    book("into-thin-air", "Into Thin Air", "Jon Krakauer"),
    book("the-5-love-languages", "The 5 Love Languages", "Gary Chapman"),
    book(
      "the-almanack-of-naval-ravikant",
      "The Almanack of Naval Ravikant",
      "Eric Jorgenson",
    ),
    book("the-bitcoin-standard", "The Bitcoin Standard", "Saifedean Ammous"),
    book(
      "never-split-the-difference",
      "Never Split the Difference",
      "Chris Voss with Tahl Raz",
    ),
    book(
      "the-design-of-everyday-things",
      "The Design of Everyday Things",
      "Don Norman",
    ),
    book(
      "how-to-win-friends-and-influence-people",
      "How to Win Friends and Influence People",
      "Dale Carnegie",
    ),
    book("sapiens", "Sapiens", "Yuval Noah Harari"),
    book("atomic-habits", "Atomic Habits", "James Clear"),
  ]),
});

export const allFavoriteBooks = Object.freeze([
  ...booksByCategory.fiction,
  ...booksByCategory.nonfiction,
]);
