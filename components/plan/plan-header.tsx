"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeBanner } from "./resume-banner";
import { PLAN, type Task } from "@/lib/plan-data";

/**
 * Шапка плана. PRD рендерит её над всеми видами, поэтому она живёт выше
 * переключателя видов и не зависит от выбранного дня.
 *
 * Держит ровно одну работу: сказать, что делать сейчас. Заголовок, Adjust Plan
 * и resume-баннер с единственным первичным действием экрана.
 *
 * Plan strip PRD кладёт сюда же, но он отсюда убран. Он не действие, а прибор:
 * отвечает на «где я в программе», а не на «что делать». Рядом с баннером два
 * блока спорили за первый взгляд, и шапка занимала 407px — 51% окна 1440×800,
 * то есть до первой задачи приходилось листать. Стрип переехал в колонку к
 * остальным приборам — Next Goal и, через рельс, Prep Map.
 *
 * Функциональное требование PRD при этом цело: оно не «быть в шапке», а
 * рендериться над всеми видами. Стрип остаётся выше переключателя и
 * переключение вкладок переживает.
 *
 * Фон turquoise-lc с нижней рамкой 2px повторяет полосу шапки на текущей
 * странице My Plan.
 */

type PlanHeaderProps = {
  today: string;
  resume: { task: Task; date: string } | null;
  onAdjustPlan: () => void;
  onStart: () => void;
};

/*
 * Геометрия шапки снята с `Page header_V2`: заливка turquoise-lc, обводка
 * только снизу 2px, паддинги 48 сверху, 56 по бокам, 32 снизу, гэп 32.
 *
 * Заголовок там Inter 900 40/48 с трекингом -0.72 — это токен `display-xl`
 * с весом, назначенным на месте. Стояло display-m, то есть 32/38 весом 800.
 */
export function PlanHeader({ today, resume, onAdjustPlan, onStart }: PlanHeaderProps) {
  return (
    <header className="border-b-[2px] border-soft-black bg-turquoise-lc px-14 pt-12 pb-8">
      <div className="mx-auto flex w-full max-w-[var(--study-surface-width)] flex-col gap-8">
        <div className="flex items-center justify-between gap-6">
          <h1 className="text-display-xl font-black">{PLAN.studentFirstName}&apos;s Plan</h1>
          <Button variant="secondary" onClick={onAdjustPlan} className="shrink-0">
            Adjust Plan
            <SlidersHorizontal className="size-[16px]" strokeWidth={2.5} />
          </Button>
        </div>

        {resume ? (
          <ResumeBanner task={resume.task} date={resume.date} today={today} onStart={onStart} />
        ) : null}
      </div>
    </header>
  );
}
