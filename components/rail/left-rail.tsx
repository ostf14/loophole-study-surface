"use client";

import { Lock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <aside className="flex w-full shrink-0 flex-col gap-8 lg:w-[var(--study-rail-width)]">
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
      {/* Черта отделяет то, что ведёт наружу. Выше — инструменты этого плана:
          Prep Map и полки закладок. Video Course Review — ссылки в другой
          продукт и запертая за его покупкой фича, к плану отношения не имеет.
          Без черты все три раздела читались одним потоком, как три
          равноправных прибора.

          Толщина 2px: линий тоньше в системе не существует, это её
          единственный законный вес. Под чертой 32 — тот же отступ, что и над
          ней даёт гэп рельса, так что черта стоит по центру разрыва. */}
      <Section title="Video Course Review" className="border-t-[2px] border-soft-black pt-8">
        <ul className="flex flex-col gap-2 text-body-s">
          {/* py-1 растит цель нажатия с 17 до 25 и удовлетворяет WCAG 2.5.8
              (24×24). У строчного элемента вертикальный паддинг не двигает
              строку — он только расширяет область попадания, так что ритм
              списка остаётся прежним. Ссылка внутри заметки этого не требует:
              там действует исключение для ссылок внутри текста. */}
          <li>
            <a href="#" className="lh-link py-1 font-semibold">
              My Saved Videos
            </a>
          </li>
          <li>
            <a href="#" className="lh-link py-1 font-semibold">
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
    <div className="flex flex-col gap-3">
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
      /*
       * Lookup — «the Lookup control» из PRD, то есть действие, а не переход.
       * Раньше он был размечен `lh-link`: подчёркнутый turquoise-hc, то есть
       * стилем ссылки. После этой правки `lh-link` на экране значит ровно
       * одно — уход наружу: «My Saved Videos», «My History» и ссылка внутри
       * заметки. Действие в рельсе несёт `Button` варианта ghost: у него нет
       * ни рамки, ни заливки, ни движения — только смена фона на ховер, — и
       * рядом с заголовком секции он не спорит с ним весом.
       */
      action={
        <Button
          variant="ghost"
          className="h-8 px-3"
          iconSide="leading"
          icon={<Search className="size-[13px]" strokeWidth={3} />}
        >
          Lookup
        </Button>
      }
    >
      <div className="flex flex-col gap-3" data-note="prep-map">
        {PREP_MAP.map((stage) => (
          /* Один порядок для всех пяти: заголовок, под ним строка состояния,
             под ней сегменты. Раньше метрика стояла справа от заголовка и не
             влезала в ширину рельса — переносилась на две строки, и высоты
             карточек скакали от 74 до 103. */
          <Card key={stage.id} hover="xs" className="flex flex-col gap-2 px-4 py-3">
            <span className={cn("text-body-small font-extrabold", stage.startsOn && "text-pewter-hc")}>
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
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-body-small font-extrabold text-soft-black">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-body-xs text-pewter-hc">{children}</p>;
}
