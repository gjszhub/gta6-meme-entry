// GTA 6 meme entry for make.fun (gta6-meme-x-01), v3.
// The meme (meme.png) was composed in this session: the same Vice City
// loading-screen scene as v2, with the title restyled in Pricedown, the
// actual GTA logo font. This program only hands the entry's files to the
// grader: it copies POST.json (the X post's address) and meme.png into the
// output directory. The post itself is judged by the house reading it
// from X, not by this file.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const OUTPUT = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const ROOT = new URL(".", import.meta.url).pathname;

const FILES = ["POST.json", "meme.png"];

function fail(message) {
  throw new Error("gta6-meme entry: " + message);
}

function main() {
  mkdirSync(OUTPUT, { recursive: true });

  for (const name of FILES) {
    const src = join(ROOT, name);
    if (!existsSync(src)) fail(name + " is missing from the repository root");
    copyFileSync(src, join(OUTPUT, name));
    console.log("wrote " + name + " to " + join(OUTPUT, name));
  }

  // The meme must be a real PNG: check the 8-byte signature and read its
  // pixel size from the IHDR chunk (bytes 16-23, big-endian uint32s).
  const png = readFileSync(join(OUTPUT, "meme.png"));
  const head = png.subarray(0, 8);
  const magic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!head.equals(magic)) fail("meme.png is not a valid PNG file");
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (width !== 1024 || height !== 1024) {
    fail("meme.png must be 1024x1024, got " + width + "x" + height);
  }
  console.log("meme.png: " + png.length + " bytes, " + width + "x" + height);

  const post = JSON.parse(readFileSync(join(OUTPUT, "POST.json"), "utf8"));
  if (typeof post.url !== "string" || !post.url.startsWith("https://")) {
    fail("POST.json does not carry an https url");
  }
  console.log("entry files OK in " + OUTPUT);
}

main();
