"use client";

import { useEffect } from "react";
import { install } from "@/lib/diagnostics";

/**
 * Ставит `window.__lo` и печатает в консоль, что с ним делать.
 *
 * Ничего не рендерит: это не элемент экрана, а то, что рецензент находит,
 * когда открывает девтулзы. Проверки нужны на живом DOM, поэтому ставятся
 * после монтирования — на сервере их звать не по чему.
 */
export function Diagnostics() {
  useEffect(install, []);
  return null;
}
