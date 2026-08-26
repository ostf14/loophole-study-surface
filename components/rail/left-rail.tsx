"use client";

import { Lock, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SegmentMeter } from "@/components/ui/segment-meter";
import { cn } from "@/lib/cn";
import { PREP_MAP, type Embed } from "@/lib/plan-data";
import { formatShort } from "@/lib/plan";

/**
 * Левый рельс, перенесённый с текущей страницы: карточки Prep Map,
 * My Workouts, My Routines, Video Course Review.
 *
 * Селектора планов здесь нет, хотя PRD его требует. Он дублировал стрип
 * целиком: те же пять планов, тот же порядок, тот же признак текущего —
 * только без пропорций, дат, вех и маркера сегодня. Собственных функций у
 * него было две, и обе отпали. Тихая строка «план можно поменять» — пересказ
 * словами кнопки Adjust Plan, которая стоит на том же экране. Переход «на
 * первый невыполненный день» не наблюдаем: четыре плана из пяти в будущем,
 * там ничего не выполнено, и он совпадает с первым днём; у текущего плана он
 * приводит на сегодня, то есть туда, где студент уже стоит. Ту же работу
 * лучше делает Continue в шапке — он доводит до самой задачи, а не до даты.
 *
 * Пустые состояния стадий показывают дату старта, подтянутую из фаз стрипа:
 * ноль в шкале читается как сломанный интерфейс, дата — как «ещё не время».
 * Сами сегменты при этом рисуются у всех пяти, как на живом экране My Plan,
 * поэтому карточки одной высоты и рельс читается лестницей.
 */

type LeftRailProps = {
  workouts: Embed[];
  routines: Embed[];
};

export function LeftRail({ workouts, routines }: LeftRailProps) {
  return (
    <aside className="flex w-[var(--study-rail-width)] shrink-0 flex-col gap-8">
      <PrepMap />
      <Section title="My Workouts">
        <Bookmarked
          items={workouts}
          empty="Bookmark workouts from any Workout Menu to add them to My Workouts."
        />
      </Section>
      <Section title="My Routines">
        <Bookmarked
          items={routines}
          empty="Bookmark routines from your plan to add them to My Routines."
        />
      </Section>
      <Section title="Video Course Review">
        <ul className="flex flex-col gap-2 text-body-s">
          <li>
            <a href="#" className="lh-link font-semibold">
              My Saved Videos
            </a>
          </li>
          <li>
            <a href="#" className="lh-link font-semibold">
              My History
            </a>
          </li>
          {/* lh-link-lock — их штатный механизм гейтинга платных фич.
              Ряд держится в одну строку: размытый текст в две читался
              как артефакт рендера, а не как закрытая функция. */}
          <li className="flex flex-col gap-1 text-pewter-hc">
            <span className="flex items-center gap-2">
              <Lock className="size-[14px] shrink-0" strokeWidth={2.5} />
              <span className="lh-link-lock font-semibold whitespace-nowrap">Concept Review</span>
            </span>
            <span className="text-body-xs">unlocks with the video course</span>
          </li>
        </ul>
      </Section>
    </aside>
  );
}

/** Букмарки одного вида. Пустое состояние — дословная строка из PRD. */
function Bookmarked({ items, empty }: { items: Embed[]; empty: string }) {
  if (!items.length) return <Empty>{empty}</Empty>;
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <Card key={item.id} hover="xs" className="flex flex-col px-4 py-2">
          <span className="text-body-s font-semibold">{item.name}</span>
          <span className="text-body-xs text-pewter-hc">{item.meta}</span>
        </Card>
      ))}
    </div>
  );
}

function PrepMap() {
  return (
    <Section
      title="Prep Map"
      action={
        <button type="button" className="lh-link inline-flex items-center gap-1 text-body-s font-semibold">
          <Search className="size-[13px]" strokeWidth={3} />
          Lookup
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        {PREP_MAP.map((stage) => (
          /* Один порядок для всех пяти: заголовок, под ним строка состояния,
             под ней сегменты. Раньше метрика стояла справа от заголовка и не
             влезала в ширину рельса — переносилась на две строки, и высоты
             карточек скакали от 74 до 103. */
          <Card key={stage.id} hover="xs" className="flex flex-col gap-2 px-4 py-3">
            <span className={cn("text-body-m font-extrabold", stage.startsOn && "text-pewter-hc")}>
              {stage.name}
            </span>

            <span className="text-body-xs text-pewter-hc">
              {stage.startsOn
                ? `Not started · starts ${formatShort(stage.startsOn)}`
                : `${stage.done}/${stage.total} ${stage.metric}`}
            </span>

            {/* Сегменты показываются у всех пяти стадий, как на живом экране
                My Plan: там у незапущенных стоят семь пустых квадратов.
                Строка с датой старта при этом остаётся — она объясняет ноль,
                чтобы он не читался как сломанный интерфейс. */}
            <SegmentMeter
              done={stage.done}
              total={stage.total}
              /* Метки следующего сегмента нет: seafoam рядом с sand не
                 читается, а границу пройденного и так показывает заливка. */
              next="none"
              size={26}
            />
          </Card>
        ))}
      </div>
    </Section>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-body-m font-extrabold text-soft-black">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-body-xs text-pewter-hc">{children}</p>;
}
