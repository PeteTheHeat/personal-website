import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const projects = [
  {
    slug: "gender-reveal",
    source: "/Users/peterargany/workspace/gender-reveal-pokemon-2",
  },
  {
    slug: "character-select",
    source: "/Users/peterargany/workspace/names-chooser",
  },
];

function run(command, args, cwd) {
  execFileSync(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
  });
}

for (const project of projects) {
  const dist = join(project.source, "dist");
  const target = join(repoRoot, "public", "projects", project.slug);

  if (!existsSync(project.source)) {
    throw new Error(`Missing project source: ${project.source}`);
  }

  console.log(`\nSyncing ${project.slug}`);
  run("npm", ["run", "build", "--", "--base=./"], project.source);

  if (!existsSync(dist)) {
    throw new Error(`Build did not create dist: ${dist}`);
  }

  rmSync(target, { force: true, recursive: true });
  mkdirSync(dirname(target), { recursive: true });
  cpSync(dist, target, { recursive: true });
}

console.log("\nProject builds synced to public/projects.");
