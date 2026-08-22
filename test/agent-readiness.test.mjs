import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { agentPages, markdownRouteKeys } from "../content/agent-pages.js";
import sitemap from "../app/sitemap.js";
import nextConfig from "../next.config.mjs";

const root = new URL("../", import.meta.url);

test("publishes a substantial Markdown representation for every agent route", () => {
  assert.ok(markdownRouteKeys.length >= 10);

  for (const [slug, page] of Object.entries(agentPages)) {
    assert.match(page.markdown, /^# /);
    assert.ok(page.markdown.length >= 300, `${slug} Markdown is too thin`);
    assert.match(page.markdown, /https:\/\/peterargany\.com|https:\/\/github\.com/);
  }

  assert.ok(agentPages.home.markdown.length >= 1_200);
  assert.match(agentPages.home.markdown, /## When to use this site/);
});

test("negotiates canonical public pages to their Markdown variants", async () => {
  const { beforeFiles: rewrites, afterFiles, fallback } = await nextConfig.rewrites();

  assert.equal(rewrites.length, markdownRouteKeys.length);
  assert.deepEqual(afterFiles, []);
  assert.equal(fallback.length, 1);
  assert.equal(fallback[0].source, "/:path*");
  assert.equal(fallback[0].destination, "/agent-content/not-found");
  assert.equal(fallback[0].has?.[0]?.key, "accept");
  assert.match(fallback[0].has?.[0]?.value ?? "", /text\/markdown/);
  for (const rewrite of rewrites) {
    assert.equal(rewrite.has?.[0]?.key, "accept");
    assert.match(rewrite.has?.[0]?.value ?? "", /text\/markdown/);
    assert.match(rewrite.destination, /^\/agent-content\//);
  }
});

test("lists every public agent route in the sitemap with freshness metadata", () => {
  const entries = sitemap();
  const urls = new Set(entries.map((entry) => new URL(entry.url).pathname));

  for (const page of Object.values(agentPages)) {
    assert.ok(urls.has(page.path), `Missing ${page.path} from sitemap`);
  }

  assert.ok(entries.every((entry) => entry.lastModified));
});

test("llms.txt explains when to use the site and how to recover", async () => {
  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8");

  assert.match(llms, /## When to use this site/);
  assert.match(llms, /Accept: text\/markdown/);
  assert.match(llms, /sitemap\.xml/);
  assert.match(llms, /missing route returns HTTP 404/i);
});

test("custom 404 exposes human and agent recovery links", async () => {
  const source = await readFile(new URL("../app/not-found.jsx", import.meta.url), "utf8");

  assert.match(source, /404 recovery links/);
  assert.match(source, /sitemap\.xml/);
  assert.match(source, /llms\.txt/);
  assert.match(source, /href="\/"/);
});

test("homepage publishes Person and WebSite JSON-LD plus substantial context", async () => {
  const source = await readFile(new URL("../app/page.jsx", import.meta.url), "utf8");
  const clientSource = await readFile(
    new URL("../app/home-client.jsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /"@type": "Person"/);
  assert.match(source, /"@type": "WebSite"/);
  assert.match(source, /HomeContext/);
  assert.match(
    source,
    /<h1 id="home-context-title">Peter Argany and his personal projects<\/h1>/,
  );
  assert.match(source, /NoScriptHome/);
  assert.match(source, /<noscript>/);
  assert.match(source, /<h1>Peter Argany<\/h1>/);
  assert.match(source, /application\/ld\+json/);
  assert.match(clientSource, /useState\(\{ scale: 1, x: 0, y: 0 \}\)/);
  assert.match(clientSource, /useLayoutEffect\(\(\) =>/);
  assert.doesNotMatch(clientSource, /<h1>/);
});
