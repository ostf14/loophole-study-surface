import type { NoteBlock, Run, Task } from "@/lib/plan-data";

/**
 * Инлайновые заметки под строкой задачи. PRD требует рендерить их богатым
 * текстом прямо в списке, без поповера: «Plan Notes render inline beneath its
 * row as rich text (bold, links, personality intact)».
 *
 * Поля Prep Map Point Intro (Overview, What This Looks Like, Goals, How to
 * Move On) идут тем же блоком. Overview ведёт абзацем без метки, остальные
 * поля — вторичными строками с короткими лид-инами: четыре равновесных
 * подписи капсом читались как каша.
 *
 * Весь блок идёт цветом pewter-hc. Заголовок задачи остаётся единственной
 * почти чёрной вещью в строке: раньше заметка шла тем же soft-black тем же
 * кеглем и весом, то есть подпорка звучала ровно так же громко, как то, что
 * она подпирает.
 *
 * Вертикальной линии слева нет. Рамок тоньше двух пикселей и серых линий в
 * системе не существует, а границы блока и так заданы разделителями строк
 * сверху и снизу.
 */

export function PlanNotes({ task }: { task: Task }) {
  if (!task.notes && !task.intro) return null;

  return (
    <div className="flex flex-col gap-2 text-pewter-hc">
      {task.notes?.map((block, i) => (
        <Block key={i} block={block} />
      ))}

      {task.intro ? (
        <>
          <p className="text-body-s">{task.intro.overview}</p>
          <Field label="Looks like" value={task.intro.looksLike} />
          <Field label="Goal" value={task.intro.goals} />
          <Field label="Move on" value={task.intro.moveOn} />
        </>
      ) : null}
    </div>
  );
}

function Block({ block }: { block: NoteBlock }) {
  if (block.kind === "list") {
    return (
      <ul className="flex list-disc flex-col gap-1 pl-4 text-body-s">
        {block.items.map((runs, i) => (
          <li key={i}>
            <Runs runs={runs} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="text-body-s">
      <Runs runs={block.runs} />
    </p>
  );
}

function Runs({ runs }: { runs: Run[] }) {
  return (
    <>
      {runs.map((run, i) => {
        if ("href" in run) {
          return (
            <a key={i} href={run.href} className="lh-link">
              {run.t}
            </a>
          );
        }
        if ("bold" in run) {
          return (
            <b key={i} className="font-semibold text-soft-black">
              {run.t}
            </b>
          );
        }
        return <span key={i}>{run.t}</span>;
      })}
    </>
  );
}

/*
 * Поле Prep Map Point Intro. Тело заметки — одна роль, поэтому и свободный
 * текст, и эти поля идут одним кеглем: раньше абзац шёл четырнадцатым, а поля
 * двенадцатым, и одно и то же — описание задачи — читалось двумя размерами
 * просто потому, что данные разной формы.
 *
 * Различает их вес, а не размер: на четырнадцати `caption-large` (w600) —
 * подпись, `body-s` (w500) — текст. Та же пара работает в карточке цели, где
 * критерий набран caption-large.
 */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-body-s text-pewter-hc">
      <span className="text-caption-large uppercase">{label}:</span> {value}
    </p>
  );
}
