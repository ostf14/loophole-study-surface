/**
 * Общий конверт всех проверок. Один и тот же объект возвращается в консоль
 * браузера, в `window.__lo` и в терминальный прогон `npm run audit` — считать
 * результат по-разному негде.
 */

export type Row = Record<string, string | number>;

export type AuditResult = {
  /** Ключ для `__lo`, он же имя в выводе терминала. */
  id: string;
  title: string;
  /** Что именно проверяется — одной строкой, для человека. */
  what: string;
  ok: boolean;
  /** Итог словами: либо «всё сошлось», либо сколько и чего не сошлось. */
  verdict: string;
  /** Сколько всего проверено. */
  total: number;
  failures: Row[];
  rows: Row[];
};
