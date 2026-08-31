/*
 * All three checks in one command: `npm run audit`.
 *
 * The checks live in the bundle, in `lib/diagnostics/`, and the screen puts them
 * on `window.__lo` itself. So the shortest route is to open the page and type
 * `__lo.check()` in the browser console; nothing needs installing. This file
 * does the same thing hands-free: it starts headless Chromium, opens the screen
 * and calls the same function. The exit code is non-zero if any check fails, so
 * it can go in CI.
 *
 * One implementation for both routes, typechecked and linted with the screen, so
 * the terminal and the console cannot disagree.
 *
 * The browser is not a dependency: `playwright-core` does not pull one. Any
 * installed Chrome or Chromium will do; the path comes from `CHROME_PATH`,
 * otherwise the usual locations are tried, otherwise the `chrome` channel if the
 * system has it.
 *
 * The screen's address is `AUDIT_URL`, http://localhost:3000 by default.
 */
import { chromium } from "playwright-core";
import { existsSync } from "node:fs";

const URL = process.env.AUDIT_URL ?? "http://localhost:3000";

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
].filter(Boolean);

function launchOptions() {
  const found = CANDIDATES.find((p) => existsSync(p));
  const args = ["--no-sandbox"];
  return found ? { executablePath: found, args } : { channel: "chrome", args };
}

const browser = await chromium.launch(launchOptions()).catch((err) => {
  console.error(
    "Could not start a browser. Point CHROME_PATH at a Chrome binary,\n" +
      "or open the screen and type `__lo.check()` in the browser console.\n\n" +
      err.message,
  );
  process.exit(2);
});

const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });

try {
  await page.goto(URL, { waitUntil: "networkidle", timeout: 20000 });
} catch {
  console.error(`No answer from ${URL}. Run \`npm run dev\` or set AUDIT_URL.`);
  await browser.close();
  process.exit(2);
}

const ready = await page
  .waitForFunction(() => Boolean(window.__lo), null, { timeout: 10000 })
  .then(() => true)
  .catch(() => false);

if (!ready) {
  console.error("`window.__lo` never appeared: the page loaded but the client layer did not mount.");
  await browser.close();
  process.exit(2);
}

const results = await page.evaluate(() => window.__lo.check().results);

let failed = 0;
for (const { ok, title, what, verdict, failures } of results) {
  if (!ok) failed++;
  console.log(`\n${ok ? "✓" : "✗"} ${title} — ${what}`);
  console.log(`  ${verdict}`);
  if (!ok) console.log(JSON.stringify(failures, null, 2).replace(/^/gm, "    "));
}

await browser.close();
console.log(failed ? `\n${failed} of ${results.length} checks failed.` : `\nAll ${results.length} checks passed.`);
process.exit(failed ? 1 : 0);
