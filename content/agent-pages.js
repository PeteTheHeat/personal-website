const siteUrl = "https://peterargany.com";

export const agentPages = Object.freeze({
  home: {
    path: "/",
    title: "Peter Argany",
    markdown: `# Peter Argany

Peter Argany is a software engineer in San Francisco. This is his personal website: a portfolio of playful software, small tools, family projects, and long-running projects made for friends.

## What is here

- [Bar Argany](${siteUrl}/menu) — a Barcelona-inspired home drink menu. It is a personal menu, not a commercial bar, store, or reservation service.
- [When Was It?](${siteUrl}/when-was-it) — a five-round history game. Guess the year of each event; every year missed adds one point, so the lowest score wins.
- [Couch QBs History Books](${siteUrl}/fantasy-football) — thirteen seasons of standings, champions, records, head-to-head results, and punishments from a private fantasy-football league.
- [Gender Reveal](${siteUrl}/gender-reveal) — a playable Game Boy-style family pregnancy announcement.
- [Character Select](${siteUrl}/character-select) — a fighting-game-inspired baby-name chooser.
- [Favorite Books](${siteUrl}/books) — Peter's favorite fiction and nonfiction books in a pixel-art bookshelf.

## Who this site is for

The site is for people who want to learn about Peter or use one of these projects. Everything listed above is free to visit. The site is not a software company, online store, developer platform, or representative of Peter's employer.

## When to use this site

Use it when someone asks about Peter Argany's personal work, his public side projects, the When Was It history game, Bar Argany, or the Couch QBs fantasy-football archive. For identity or contact information, prefer the [About](${siteUrl}/about) and [Contact](${siteUrl}/contact) pages.
`,
  },
  books: {
    path: "/books",
    title: "Peter Argany's Favorite Books",
    markdown: `# Peter Argany's Favorite Books

This page is Peter Argany's personal bookshelf: a snapshot of every fiction and nonfiction title marked with the highest favorite score in his reading list. The interactive HTML page presents the books inside the same pixel-art CRT studio and mobile phone used by the homepage, with a Fiction or Nonfiction toggle and pagination.

## Favorite fiction

- Project Hail Mary — Andy Weir
- Ender's Game — Orson Scott Card
- 1984 — George Orwell
- Ready Player One — Ernest Cline
- Anthem — Ayn Rand
- Brave New World — Aldous Huxley
- The Guest List — Lucy Foley
- Do Androids Dream of Electric Sheep? — Philip K. Dick
- Red Rising — Pierce Brown

## Favorite nonfiction

- How to Fail at Almost Everything and Still Win Big — Scott Adams
- Salt, Fat, Acid, Heat — Samin Nosrat
- Influence: The Psychology of Persuasion — Robert B. Cialdini
- American Kingpin — Nick Bilton
- Storyworthy — Matthew Dicks
- Thinking in Bets — Annie Duke
- Living with a SEAL — Jesse Itzler
- The Psychology of Money — Morgan Housel
- Into Thin Air — Jon Krakauer
- The 5 Love Languages — Gary Chapman
- The Almanack of Naval Ravikant — Eric Jorgenson
- The Bitcoin Standard — Saifedean Ammous
- Never Split the Difference — Chris Voss with Tahl Raz
- The Design of Everyday Things — Don Norman
- How to Win Friends and Influence People — Dale Carnegie
- Sapiens — Yuval Noah Harari
- Atomic Habits — James Clear

Book titles on the HTML page open Amazon book-search results. [Browse the bookshelf](${siteUrl}/books) or [return home](${siteUrl}/).
`,
  },
  menu: {
    path: "/menu",
    title: "Bar Argany",
    markdown: `# Bar Argany

Bar Argany is a Barcelona-inspired home drink menu made by Peter Argany. It lists cocktails, classics, mocktails, and soft drinks that may be available at home.

This is not a commercial bar, restaurant, delivery service, or reservation system. The page has two views: Drinks and No Booze. Each section lists drink names and, when useful, a short ingredient description.

[Return to Peter Argany's homepage](${siteUrl}/).
`,
  },
  "when-was-it": {
    path: "/when-was-it",
    title: "When Was It?",
    markdown: `# When Was It?

When Was It? is a free five-round browser game by Peter Argany. Each round shows a famous historical event and asks the player to guess its year. Every year between the guess and the correct answer adds one point; the lowest total score wins.

The game uses a curated collection of fifty events and can publish a chosen player name and verified score to a small public leaderboard. No account is required.

[Play When Was It?](${siteUrl}/when-was-it) or [return home](${siteUrl}/).
`,
  },
  "fantasy-football": {
    path: "/fantasy-football",
    title: "Couch QBs History Books",
    markdown: `# Couch QBs History Books

This page is the historical archive for Couch Quarterbacks, a private fantasy-football league. It combines thirteen seasons of NFL.com and Sleeper results into all-time standings, championships, weekly records, season finishes, head-to-head comparisons, rivalry results, and a Hall of Losers.

The archive is for league members and friends. It is not fantasy advice, sports betting, or an official NFL or Sleeper product.

[Open the history books](${siteUrl}/fantasy-football) or [return home](${siteUrl}/).
`,
  },
  "gender-reveal": {
    path: "/gender-reveal",
    title: "Gender Reveal",
    markdown: `# Gender Reveal

Gender Reveal is a playable Game Boy-style pregnancy announcement made for the Argany family. The public page embeds a small interactive project and is intended as a family celebration, not as a health, medical, or pregnancy-information resource.

[Open the project](${siteUrl}/gender-reveal) or [return to Peter Argany's homepage](${siteUrl}/).
`,
  },
  "character-select": {
    path: "/character-select",
    title: "Character Select",
    markdown: `# Character Select

Character Select is a fighting-game-inspired baby-name chooser made for the Argany family. The public page embeds the interactive project, which presents possible names as a playful roster rather than as naming advice or a commercial service.

[Open Character Select](${siteUrl}/character-select) or [return to Peter Argany's homepage](${siteUrl}/).
`,
  },
  about: {
    path: "/about",
    title: "About Peter Argany",
    markdown: `# About Peter Argany

Peter Argany is a software engineer based in San Francisco. He works at OpenAI and uses this personal site for software he makes outside the shape of a normal product: games for friends, family projects, personal tools, and archives that preserve a group's history.

The common thread is practical playfulness. The projects are small enough to understand, specific enough to be useful, and designed for real people Peter knows. This is a personal portfolio and does not speak for OpenAI or any other organization.

Public profiles: [GitHub](https://github.com/PeteTheHeat), [LinkedIn](https://www.linkedin.com/in/peterargany/), and [X](https://x.com/peterargany).
`,
  },
  contact: {
    path: "/contact",
    title: "Contact Peter Argany",
    markdown: `# Contact Peter Argany

The best public ways to contact Peter Argany are [LinkedIn](https://www.linkedin.com/in/peterargany/) and [X](https://x.com/peterargany). For questions about source code or a public repository, use [Peter's GitHub profile](https://github.com/PeteTheHeat) and the relevant repository's issue tracker when one is available.

This personal website does not provide customer support, sales, recruiting, reservations, or support for OpenAI products. Do not use it to send private credentials, medical information, financial information, or other sensitive data.

[Return to the homepage](${siteUrl}/).
`,
  },
  privacy: {
    path: "/privacy",
    title: "Privacy",
    markdown: `# Privacy

Peterargany.com uses Vercel Web Analytics and Speed Insights to understand aggregate visits and site performance. Vercel receives the technical data necessary to provide those services; its handling is governed by Vercel's privacy notice.

Most projects require no account. Some interactive projects may store progress or preferences in the browser. When a player chooses to submit a When Was It? leaderboard entry, the site stores the submitted display name, verified score, and a random submission identifier. The Sacko Tracker administration route uses a secure session cookie for authorized access.

Do not submit sensitive personal information through public game fields. Questions can be sent through the public methods on the [Contact page](${siteUrl}/contact).
`,
  },
  "sacko-tracker": {
    path: "/sacko-tracker",
    title: "Dave's 24 in 24 Sacko Tracker",
    markdown: `# Dave's 24 in 24 Sacko Tracker

This public page records progress on a Couch Quarterbacks fantasy-football punishment: a combined target of twenty-four donuts, beers, and miles. It shows the verified totals and completion status for league members and friends.

The tracker is an archive of a private league challenge. It is not health guidance, a recommendation to attempt the challenge, or a commercial product.

[Open the tracker](${siteUrl}/sacko-tracker) or [visit the league archive](${siteUrl}/fantasy-football).
`,
  },
});

export const markdownRouteKeys = Object.keys(agentPages);
