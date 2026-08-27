/*
 * Все три проверки одной командой: `npm run audit`.
 *
 * Скрипты в этой папке написаны так, чтобы их можно было просто вставить
 * в консоль браузера на живом экране — это остаётся самым коротким путём,
 * ничего ставить не нужно. Этот файл делает то же самое без рук: поднимает
 * headless-Chromium, открывает экран, выполняет в нём каждый скрипт и
 * печатает отчёт. Код возврата ненулевой, если хоть одна проверка не сошлась,
 * поэтому его можно повесить в CI.
 *
 * Браузер не входит в зависимости: `playwright-core` их не тянет. Нужен любой
 * установленный Chrome или Chromium; путь берётся из `CHROME_PATH`, иначе
 * пробуются обычные места, иначе — канал `chrome`, если он в системе есть.
 *
 * Адрес экрана — `AUDIT_URL`, по умолчанию http://localhost:3000.
 */
import { chromium } from "playwright-core";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/* Канонический дом скриптов — `public/audits/`. Оттуда их отдаёт сам сайт,
   поэтому один и тот же файл выполняют три пути: эта запускалка, консоль
   браузера и панель дизайн-системы на живом экране. Копий нет, расходиться
   нечему. */
const HERE = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "audits");
const URL = process.env.AUDIT_URL ?? "http://localhost:3000";

const CHECKS = [
  ["ds-check.js", "Figma reconciliation", "named values against what was read out of the file"],
  ["token-audit.js", "Type scale", "every text node against the token table"],
  ["paint-audit.js", "Paint and shadow", "every visible element against the palette"],
];

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
      "или вставьте скрипты из design-system/ в консоль браузера вручную.\n\n" +
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

let failed = 0;
for (const [file, title, what] of CHECKS) {
  const source = readFileSync(join(HERE, file), "utf8");
  const { ok, verdict, failures } = await page.evaluate(source + ";");
  if (!ok) failed++;
  console.log(`\n${ok ? "✓" : "✗"} ${title} — ${what}`);
  console.log(`  ${verdict}`);
  if (!ok) console.log(JSON.stringify(failures, null, 2).replace(/^/gm, "    "));
}

await browser.close();
console.log(
  failed ? `\n${failed} of ${CHECKS.length} checks failed.` : `\nAll ${CHECKS.length} checks passed.`,
);
process.exit(failed ? 1 : 0);
