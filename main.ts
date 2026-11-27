// Deal Radar's hand-in program (Node 22, standard library only).
//
// The site is the plain static files in this directory's app/ folder: a
// browser opens app/index.html, the deals live in app/data.js, and nothing
// the site runs, styles or shows loads over the network — each deal only
// links out to its store. This program hands the site in: it copies app/
// and screenshots/ from beside this file into /output and writes
// /output/dossier.json, the summary of the entry (the screenshots, the
// first load's files and bytes, and the source), built with the vendored
// make.fun library. Leave vendor/makefun-frontend.ts exactly as it is: the
// scorer rebuilds the dossier with its own copy and compares the two byte
// for byte, so any change there would fail the entry.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outDir, { recursive: true });
cpSync(join(here, "app"), join(outDir, "app"), { recursive: true });
mkdirSync(join(outDir, "screenshots"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(outDir, "screenshots"), { recursive: true });
}

// Refuse to hand in an empty or half-copied site: the dossier must describe
// the app that was actually copied, so check its front page landed first.
if (!existsSync(join(outDir, "app", "index.html"))) {
  throw new Error("app/index.html did not copy to " + join(outDir, "app"));
}

// The gate's caps, as the scorer applies them: at most 4 screenshots, none
// over 256 KiB; app/ at most 993 files and directories and 16 MiB in all.
// The dossier text itself is capped at 160 KiB by text_max_bytes.
writeFileSync(
  join(outDir, "dossier.json"),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
