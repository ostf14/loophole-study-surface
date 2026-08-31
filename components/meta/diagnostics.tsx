"use client";

import { useEffect } from "react";
import { install } from "@/lib/diagnostics";

/**
 * Puts `window.__lo` on the page and prints to the console what to do with it.
 *
 * Renders nothing: this is not an element of the screen but what a reviewer
 * finds on opening devtools. The checks need a live DOM, so they are installed
 * after mount — on the server there is nothing to call them against.
 */
export function Diagnostics() {
  useEffect(install, []);
  return null;
}
