/**
 * The shared envelope of all three checks. The same object goes to the browser
 * console, to `window.__lo` and to the terminal run of `npm run audit` — there
 * is nowhere for the result to be counted differently.
 */

export type Row = Record<string, string | number>;

export type AuditResult = {
  /** The key on `__lo`, and the name in the terminal output. */
  id: string;
  title: string;
  /** What exactly is checked, in one line, for a person. */
  what: string;
  ok: boolean;
  /** The verdict in words: either everything matched, or how much did not. */
  verdict: string;
  /** How many things were checked in all. */
  total: number;
  failures: Row[];
  rows: Row[];
};
