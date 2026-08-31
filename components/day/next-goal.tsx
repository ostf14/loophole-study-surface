import { Compare } from "@/components/stat-point/compare";
import { StatPoint } from "@/components/stat-point/stat-point";
import { TimeRange } from "@/components/stat-point/time-range";
import { Tag } from "@/components/ui/tag";
import { GOALS, type Goal } from "@/lib/plan-data";

/**
 * Next Goal. Both goals are built as `Stat point` cards from the Stats page —
 * their container for exactly this: the stat on top, a caption saying what is
 * being measured beneath it.
 *
 * The stat types come from the `Type` property of that same component:
 *
 *   RC — `Visual Gauge`, that is `stat-point/time-range`: a running number
 *        against a fixed goal.
 *   LR — `Compare`, a "done out of total" fraction. The criterion reads "get
 *        every conditional question right", and how many conditional questions a
 *        section holds is not known in advance — it floats. A fraction is the
 *        honest form for that.
 *
 * `Heatmap` was deliberately not used for LR: it encodes magnitude, its shades
 * are a scale of intensity, while the state here is binary — a question is
 * either clean or blown. Two values out of a gradient would look alike and read
 * wrongly.
 *
 * The card's caption is widened to three levels after `Onboarding list item` on
 * the Lists page, where the same problem is solved the same way. There it is
 * exactly three styles: label `All Caps/Caption 2` (12/18 Extra Bold, in the
 * accent colour), name `Emphasis/Body 1` (20/30 Extra Bold, soft-black),
 * explanation `Body 3` (16/24 **Medium**, pewter-hc). Here it is the same ladder
 * one step down in size: tag, name at `body-small` 800, criterion at `body-s`
 * 500.
 *
 * The criterion is 500 specifically: at 600 it competed with the name, and in
 * their own example the explanation is always Medium — weight falls from top to
 * bottom there without exception.
 *
 * The component has a single caption slot sized for a short line like "Metric
 * being measured"; name and criterion at one size read as a four-line block of
 * text.
 *
 * The section label is the `tag` component from the Tags page in its Green
 * variant. It is named for this job and holds exactly these values: LR, RC,
 * TRANSLATION, ACCURACY, LEARN. It stands above the figure: `Stat point` has no
 * slot for a label, so this is added over the component.
 *
 * The PRD puts the module at the top of the day timeline and asks for a row per
 * section when LR and RC are on different rungs.
 */

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function NextGoal() {
  return (
    <section className="flex flex-col gap-4" data-note="next-goal">
      <h2 className="text-body-small font-extrabold text-soft-black">Next Goal</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {GOALS.map((goal) => (
          <StatPoint
            key={goal.section}
            className="w-full"
            gap={goal.kind === "gate" ? 13 : 21}
            inset={goal.kind === "gate" ? 8.5 : 12.5}
            eyebrow={<Tag tone="green">{goal.section}</Tag>}
            label={
              <>
                <span className="block text-body-small font-extrabold text-soft-black">
                  {goal.name}
                </span>
                <span className="mt-1 block text-body-s text-pewter-hc">
                  {goal.criterion}
                </span>
              </>
            }
          >
            <Stat goal={goal} />
          </StatPoint>
        ))}
      </div>
    </section>
  );
}

function Stat({ goal }: { goal: Goal }) {
  if (goal.kind === "gate") {
    return <Compare amount={goal.attempts.filter(Boolean).length} of={goal.attempts.length} />;
  }

  /*
   * Variant No Deltas. Default needs about 280 for its own content, that is a
   * card from 336 up; in a 600 column two cards get 292 each, and the deltas
   * would compress — flex shrinks them silently, without overflow, breaking the
   * geometry read from the file. Three points say the same thing, and the
   * distance to the goal reads out of the numbers themselves.
   */
  return (
    <TimeRange
      start={mmss(goal.startSeconds)}
      current={mmss(goal.currentSeconds)}
      goal={mmss(goal.targetSeconds)}
    />
  );
}
