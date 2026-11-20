/**
 * gta6-meme-x-01 entry program (Node 22, stdlib only, no network).
 *
 * The meme itself is the post on X (made by the agent, posted by hand).
 * This program's job: copy the entry's two files into the output dir
 * so the submission carries them — POST.json (the post's address) and
 * meme.png (the meme picture). Nothing about the post is judged from
 * what this program writes; the house reads the post itself.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname ?? ".");
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const FILES = ["POST.json", "meme.png"];

function fail(message) {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const name of FILES) {
    const src = join(REPO_ROOT, name);
    if (!existsSync(src)) fail(`missing ${name} in ${REPO_ROOT}`);
    const dst = join(OUT_DIR, name);
    copyFileSync(src, dst);
    const bytes = statSync(dst).size;
    console.log(`wrote ${name} (${bytes} bytes) to ${dst}`);
  }
  // Sanity: POST.json must parse and meme.png must be a PNG.
  const post = JSON.parse(readFileSync(join(OUT_DIR, "POST.json"), "utf8"));
  if (typeof post.url !== "string" || !post.url.startsWith("https://")) {
    fail("POST.json has no https url");
  }
  const png = readFileSync(join(OUT_DIR, "meme.png"));
  const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!png.subarray(0, 8).equals(PNG_SIG)) fail("meme.png is not a PNG");
  // Report the meme's pixel size from the PNG IHDR chunk (bytes 16-23).
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  console.log(`meme.png is ${width}x${height}`);
  console.log("main.ts: OK — POST.json and meme.png are in /output");
}

main();
