import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { HISTORICAL_EVENTS } from "./events.js";
import {
  GAME_LENGTH,
  buildShareText,
  calculateVerifiedScore,
  qualifiesForTopThree,
  scoreGuess,
  selectRandomEvents,
} from "./game.js";

test("ships 50 stable historical events with local, sourced images", async () => {
  const ids = HISTORICAL_EVENTS.map((historicalEvent) => historicalEvent.id);
  const years = HISTORICAL_EVENTS.map((historicalEvent) => historicalEvent.year);

  assert.equal(HISTORICAL_EVENTS.length, 50);
  assert.equal(new Set(ids).size, 50);
  assert.equal(Math.min(...years), 79);
  assert.equal(Math.max(...years), 2020);

  for (const historicalEvent of HISTORICAL_EVENTS) {
    assert.match(
      historicalEvent.imageUrl,
      /^\/when-was-it\/events\/\d{3}\.webp$/,
    );
    assert.match(
      historicalEvent.sourceImageUrl,
      /^https:\/\/upload\.wikimedia\.org\//,
    );
    assert.match(
      historicalEvent.sourcePage,
      /^https:\/\/commons\.wikimedia\.org\//,
    );
    assert.ok(historicalEvent.attribution.length > 0);

    const image = await readFile(
      new URL(`../../public${historicalEvent.imageUrl}`, import.meta.url),
    );

    assert.ok(image.byteLength > 5_000);
    assert.equal(image.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(image.subarray(8, 12).toString("ascii"), "WEBP");
  }
});

test("scores a guess by its absolute distance from the year", () => {
  assert.equal(scoreGuess(1969, 1969), 0);
  assert.equal(scoreGuess(1959, 1969), 10);
  assert.equal(scoreGuess(1979, 1969), 10);
});

test("draws five unique events without changing the collection", () => {
  const source = Array.from({ length: 50 }, (_, id) => ({ id: id + 1 }));
  const snapshot = source.map((historicalEvent) => historicalEvent.id);
  const selected = selectRandomEvents(source, GAME_LENGTH, () => 0.42);

  assert.equal(selected.length, GAME_LENGTH);
  assert.equal(
    new Set(selected.map((historicalEvent) => historicalEvent.id)).size,
    GAME_LENGTH,
  );
  assert.deepEqual(
    source.map((historicalEvent) => historicalEvent.id),
    snapshot,
  );
});

test("qualifies only a score that can remain in the top three", () => {
  assert.equal(qualifiesForTopThree(500, []), true);
  assert.equal(
    qualifiesForTopThree(500, [{ score: 10 }, { score: 20 }]),
    true,
  );
  assert.equal(
    qualifiesForTopThree(29, [
      { score: 10 },
      { score: 20 },
      { score: 30 },
    ]),
    true,
  );
  assert.equal(
    qualifiesForTopThree(30, [
      { score: 10 },
      { score: 20 },
      { score: 30 },
    ]),
    false,
  );
});

test("recalculates submitted scores from five valid, unique events", () => {
  const guesses = HISTORICAL_EVENTS.slice(0, GAME_LENGTH).map(
    (historicalEvent, index) => ({
      eventId: historicalEvent.id,
      guess: historicalEvent.year + index,
    }),
  );

  assert.equal(calculateVerifiedScore(guesses, 2026), 10);
  assert.equal(calculateVerifiedScore(guesses.slice(0, 4), 2026), null);
  assert.equal(
    calculateVerifiedScore(
      [...guesses.slice(0, 4), { ...guesses[0] }],
      2026,
    ),
    null,
  );
  assert.equal(
    calculateVerifiedScore(
      guesses.map((guess, index) =>
        index === 0 ? { ...guess, guess: 2027 } : guess,
      ),
      2026,
    ),
    null,
  );
});

test("builds a compact score challenge without revealing answers", () => {
  const text = buildShareText(
    474,
    "https://peterargany.com/when-was-it",
  );

  assert.match(text, /474 years out/);
  assert.match(text, /Think you can do better\?/);
  assert.match(text, /https:\/\/peterargany\.com\/when-was-it/);

  for (const historicalEvent of HISTORICAL_EVENTS.slice(0, GAME_LENGTH)) {
    assert.doesNotMatch(text, new RegExp(historicalEvent.title, "i"));
  }
});

test("uses route-specific museum copy and metadata without old archive filler", async () => {
  const [component, styles, page, homepage, homeClient, store, route] =
    await Promise.all([
    readFile(
      new URL("./when-was-it-game.jsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("./when-was-it.css", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../../app/when-was-it/page.jsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../../app/page.jsx", import.meta.url), "utf8"),
    readFile(new URL("../../app/home-client.jsx", import.meta.url), "utf8"),
    readFile(
      new URL(
        "./leaderboard-store.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../../app/api/when-was-it/leaderboard/route.js",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);

  assert.match(
    component,
    /History feels obvious until someone asks for the year\./,
  );
  assert.match(component, /Enter the gallery/);
  assert.match(component, /Share my score/);
  assert.match(component, /wwi-board-trophy/);
  assert.doesNotMatch(component, /Peter Argany|next\/link|<Link/);
  assert.doesNotMatch(
    component,
    /already added a leaderboard score today/,
  );
  assert.doesNotMatch(
    component,
    /Date unknown|Date withheld|Dates withheld|Special exhibition|Filed and finished|Filed for posterity|collection of 50|moments in the collection|50 moments spanning/,
  );
  assert.doesNotMatch(component, /—/);
  assert.match(styles, /grid-template-rows: minmax\(0, 1fr\)/);
  assert.match(styles, /\.wwi-object-image \{[\s\S]*min-height: 0/);
  assert.match(styles, /\.wwi-mat \{[\s\S]*overflow: hidden/);
  assert.doesNotMatch(styles, /\.wwi-header > a/);
  assert.match(page, /https:\/\/peterargany\.com\/when-was-it/);
  assert.match(page, /\/when-was-it\/og\.png/);
  assert.match(homepage, /<HomeClient \/>/);
  assert.match(homeClient, /href: "\/when-was-it"/);
  assert.match(store, /upstash-sync-token/);
  assert.match(store, /HKEYS/);
  assert.doesNotMatch(
    store,
    /WhenWasItRateLimitError|rateLimitIdentity|rate-limit|SUBMISSION_RATE_LIMIT_SECONDS|KEYS\[5\]/,
  );
  assert.doesNotMatch(
    route,
    /WhenWasItRateLimitError|x-forwarded-for|x-real-ip|status: 429/,
  );
});
