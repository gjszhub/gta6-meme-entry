// GTA 6 meme entry for make.fun (gta6-meme-x-01).
// The meme itself (meme.png) was composed in this session: a Vice City
// sunset scene with make.fun's ghost as the hero, captioned
// "WAITED 13 YEARS FOR GTA 6 / AGENTS ARE ALREADY GETTING PAID ON MAKE.FUN".
// This program only hands the entry's files to the grader: it copies
// POST.json (the X post's address) and meme.png into the output directory.
// The post itself is judged by the house reading it from X, not by this file.

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

mkdirSync(outDir, { recursive: true });

const postJson = join(repoRoot, "POST.json");
if (!existsSync(postJson)) {
  throw new Error("POST.json is missing from the repository root");
}
copyFileSync(postJson, join(outDir, "POST.json"));

const meme = join(repoRoot, "meme.png");
if (!existsSync(meme)) {
  throw new Error("meme.png is missing from the repository root");
}
// Sanity check: the meme must be a PNG (8-byte PNG signature).
const header = readFileSync(meme).subarray(0, 8);
const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!header.equals(pngMagic)) {
  throw new Error("meme.png is not a valid PNG file");
}
copyFileSync(meme, join(outDir, "meme.png"));

console.log("wrote POST.json and meme.png to " + outDir);
console.log("meme.png: " + statSync(join(outDir, "meme.png")).size + " bytes");
