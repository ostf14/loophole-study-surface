/*
 * Все три проверки одной командой: `npm run audit`.
 *
 * Проверки живут в бандле, в `lib/diagnostics/`, и экран сам выставляет их
 * на `window.__lo`. Значит самый короткий путь — открыть страницу и набрать
 * в консоли браузера `__lo.check()`; ставить ничего не нужно. Этот файл
 * делает то же самое без рук: поднимает headless-Chromium, открывает экран
 * и зовёт ту же функцию. Код возврата ненулевой, если хоть одна проверка не
 * сошлась, поэтому его можно повесить в CI.
 *
 * Одна реализация на оба пути. Раньше проверки лежали здесь отдельными
 * скриптами и исполнялись в странице через `new Function`; после переезда в
 * бандл они типизированы, линтуются вместе с экраном и не могут разойтись с
 * тем, что видит рецензент.
 *
 * Браузер не входит в зависимости: `playwright-core` их не тянет. Нужен любой
 * установленный Chrome или Chromium; путь берётся из `CHROME_PATH`, иначе
 * пробуются обычные места, иначе — канал `chrome`, если он в системе есть.
 *
 * Адрес экрана — `AUDIT_URL`, по умолчанию http://localhost:3000.
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
    "Не удалось запустить браузер. Укажите путь к Chrome через CHROME_PATH,\n" +
      "или откройте экран и наберите `__lo.check()` в консоли браузера.\n\n" +
      err.message,
  );
  process.exit(2);
});

const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });

try {
  await page.goto(URL, { waitUntil: "networkidle", timeout: 20000 });
} catch {
  console.error(`Экран не отвечает на ${URL}. Запустите \`npm run dev\` или задайте AUDIT_URL.`);
  await browser.close();
  process.exit(2);
}

const ready = await page
  .waitForFunction(() => Boolean(window.__lo), null, { timeout: 10000 })
  .then(() => true)
  .catch(() => false);

if (!ready) {
  console.error("`window.__lo` не появился: страница загрузилась, но клиентский слой не смонтировался.");
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
