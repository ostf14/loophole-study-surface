"use client";

import { Tabs } from "@/components/ui/tabs";

/**
 * Переключатель видов на компоненте `Tabs` со страницы Navigation — сегментная
 * пилюля с залитым chartreuse активным элементом.
 *
 * PRD даёт три вида: Day timeline, Weekly, Full Plan; Day timeline по умолчанию.
 * Weekly и Full Plan вне скоупа и выключены явно — выключенного состояния
 * в компоненте нет, оно добавлено сверх него.
 *
 * Пейджинг ‹ Today › отсюда убран, хотя PRD описывает его частью переключателя.
 * Он меняет день, а не вид, и стоять должен рядом с тем, что меняет, — в строке
 * дня, у самой даты. Full Plan к тому же листать нечем: это весь диапазон одним
 * скроллом. Заодно ряд перестал делить ширину и вернулся к штатному поведению
 * компонента, где кнопки делят фрейм поровну.
 */

const VIEWS = [
  { id: "day", label: "Day timeline" },
  { id: "weekly", label: "Weekly", disabled: true, title: "Out of scope for this build" },
  { id: "full", label: "Full Plan", disabled: true, title: "Out of scope for this build" },
] as const;

export function ViewTabs() {
  return <Tabs items={VIEWS} selected="day" />;
}
