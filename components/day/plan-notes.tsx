import type { NoteBlock, Run, Task } from "@/lib/plan-data";

/**
 * Inline notes beneath a task row. The PRD asks for them rendered as rich text
 * in the list itself, with no popover: "Plan Notes render inline beneath its
 * row as rich text (bold, links, personality intact)».
 *
 * The Prep Map Point Intro fields (Overview, What This Looks Like, Goals, How to
 * Move On) come through the same block. Overview leads as a paragraph with no
 * label, the rest are secondary lines with short lead-ins: four labels of equal
 * weight in caps read as a mess.
 *
 * The whole block is pewter-hc. That leaves the task title as the only near-black
 * thing in the row; in soft-black at the same size and weight, the supporting
 * text spoke exactly as loudly as what it supports.
 *
 * There is no vertical rule down the left. The system has no border thinner than
 * two pixels and no grey lines, and the block's bounds are already set by the
 * row dividers above and below.
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
 * A Prep Map Point Intro field. The body of a note is one role, so free text and
 * these fields run at one size: at 14 for the paragraph and 12 for the fields,
 * the same thing — a description of the task — read at two sizes purely because
 * the data has two shapes.
 *
 * Weight tells them apart rather than size: at 14, `caption-large` (w600) is a
 * label and `body-s` (w500) is text. The same pair works in the goal card, where
 * the criterion is set in caption-large.
 */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-body-s text-pewter-hc">
      <span className="text-caption-large uppercase">{label}:</span> {value}
    </p>
  );
}
