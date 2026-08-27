# Loophole Online — Study Surface

One screen from the Study Surface PRD, built as a working prototype: **the plan
header** and the **day timeline view** with its left rail.

It runs in a browser and responds to input — checking a task off updates the day
donut, the group counter, the position icon, the resume banner and the rail. The
point is that the code can be handed to engineers as a starting point rather than
as a picture to reimplement.

## Scope

In scope, from the PRD:

- **The plan header** — plan title, Adjust Plan, the plan strip with
  proportionally sized phase segments, mile markers and a Today marker, and the
  resume banner ("Jump back in!").
- **Day timeline view** — view switcher with day paging, Next Goal, the date row
  (date dropdown paired with a progress donut), task groups, numbered task rows
  with inline Plan Notes, embedded workout and routine cards with a bookmark
  control, and the bottom day pager.
- **Left rail** — Prep Map, My Workouts, My Routines, Video Course Review.

Two things the PRD asks for are deliberately not here, both for the same reason
— on one screen they restate something else that is already louder:

- **The plan selector and its quiet line.** The PRD gives the rail "the plans in
  order, current plan highlighted", and beneath it a quiet line noting the plan
  can be changed through AI Ellen or Adjust Plan. The plan strip in the header
  already carries the plans in order with the current one filled, and adds date
  proportions, a Today marker, mile markers and hover ranges. The quiet line
  restates the Adjust Plan button standing on the same screen; Ellen belongs
  inside that modal as the alternative to manual settings. The one behaviour the
  selector owned — "jumps to that plan's first incomplete day" — went to the
  strip, which the PRD would have jump to the plan's *first* day. First
  incomplete is the more useful target: the first day of a plan you have already
  worked through is an archive.
- **The plan strip sits in the content column, not the plan header.** The PRD
  lists it inside "The plan header". It is not an action, it is an instrument:
  it answers "where am I in the programme", not "what do I do now". Next to the
  resume banner the two competed for the first read, and the header stood at
  407px — 51% of a 1440×800 window, so the first task needed a scroll. Moving
  it takes the header to 274px (34%) and leaves it one job. The strip now opens
  the column above Next Goal, so the column descends by scale: programme →
  goal → view → day → tasks. The functional requirement is intact — the PRD
  needs the strip rendered above every view, not inside the header band, and it
  still sits above the view switcher.
- **Day paging (‹ / Today / ›).** The PRD makes it part of the view switcher.
  It changes the day, not the view, so it sits in the date row next to the date
  it changes. Full Plan has nothing to page through either — it is the whole
  range in one scroll. A side effect: the switcher stopped sharing its row and
  now spans the column, so its buttons divide the frame the way the component
  does instead of hugging their labels.
- **Next Goal above the view switcher.** The PRD puts the module at the top of
  the day timeline view. It does not change with the selected day or the
  selected view — it is the next rung of the plan's goal ladder — so it sits
  above the switcher. Anything that survives switching tabs belongs outside the
  tabs, or the tab bar promises something it does not do.
- **Hide completed.** The PRD puts it in the view switcher row with the paging
  controls. Completed groups already collapse themselves by the PRD's own rule
  ("the active group renders expanded; completed groups collapse"), so the
  toggle hid what was already folded away, and it sat in the date row competing
  with the day's identity.

Deliberately out of scope: Weekly view, Full Plan view, focus mode, the task
detail popover, AI Ellen, the tutor-facing side, and paid-feature gating. Where
one of those is reachable from this screen, the control is present and either
disabled or wired to a toast that says so — the seams are visible rather than
hidden.

## Running it

Node 20.9 or newer (required by Next.js 16).

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

- `/` — the Study Surface screen. Demo data covers Jul 14 – Jul 16, 2026, with
  Jul 15 as "today"; other dates render a fallback card.
- `/kitchen-sink` — an internal page that lays out every design-system primitive
  side by side (checkbox rotations, position icon states, buttons, cards,
  time-range variants, the type scale) for comparison against the source system.
  It is a verification tool and not part of the deliverable.

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and
`lucide-react` for icons. No component library, no state management library.

## Design system

The token layer lives entirely in `app/globals.css`, in a Tailwind v4 `@theme`
block. Values were taken from the production build of `new.theloophole.com` and
from the Figma file `LO Design System (FSH Update)` — the eight colors sampled
from the rendered page via `getComputedStyle` match the CSS file exactly, and
component implementations were read off live DOM elements and Figma metadata
rather than off descriptions.

Working rules in this repo:

- **Semantic tokens only.** `text-caption-medium`, never `text-xs`.
  `text-pewter-hc`, never `text-gray-500`. Default Tailwind utilities drop the
  negative letter-spacing that every text token in this system carries.
- **No weight 400.** Body is 500, caption 600, title 700, display 800–900.
- **Neo-brutalist surfaces.** 2–3px soft-black borders, hard shadows with no
  blur, and a signature hover where the element moves up-left while its shadow
  grows by the same amount (`lh-card-hover-xs|sm|md|lg`).
- **Tilt as a motif.** The checkbox rotates on check and hover; the check inside
  `PositionIcon` is fixed at 9.72°; mile markers on the plan strip sit at 8°.
- Line heights come from the production CSS where Figma disagrees with it.

## Code structure

```
app/
  globals.css          token layer: colors, both type scales, radii, layout
                       widths, the hover/link/lock utility classes
  layout.tsx           Inter via next/font, html/body shell
  page.tsx             the screen; owns all interactive state
  kitchen-sink/        primitive comparison page
components/
  ui/                  design-system primitives: button, card, checkbox,
                       icon-button, position-icon, progress-bar,
                       progress-donut, segment-meter, tag
  stat-point/          stat-point card and stat-point/time-range
  plan/                plan-header, plan-strip, resume-banner
  day/                 view-tabs, next-goal, date-row, task-group, task-row,
                       task-icon, plan-notes, embed-card, day-pager
  rail/                left-rail
lib/
  plan-data.ts         typed fixture data
  plan.ts              everything derived from it
  cn.ts                class name join
```

Every component carries a header comment recording where its values came from
(Figma component and variant, production CSS, or an explicit approximation) and
which PRD sentence it answers. Those comments are the audit trail; they are worth
reading before changing geometry.

`app/page.tsx` is the only stateful component. It holds the selected date, the
set of completed task ids, the set of collapsed groups, the Hide completed flag,
bookmarked workouts and routines, and the toast. Everything below it is presentational and
driven by props.

### Data

`lib/plan-data.ts` holds the fixture, typed the way a real API response would
plausibly be shaped:

- `PLAN` — student first name and the plan's start and end dates.
- `PHASES` — the five plans (Tandem, RC, Accuracy, Speed, Perform) with date
  ranges; segment widths on the strip are computed from these.
- `MILE_MARKERS` — labeled dates on the strip.
- `GOALS` — Next Goal rows, one per section, as a discriminated union: `gate`
  (a run of binary attempts) or `clock` (start / current / target seconds).
- `PREP_MAP` — rail stages with a metric and a done/total count; a stage that has
  not started carries `startsOn` instead.
- `DAYS` — a record keyed by ISO date, and `ALL_DAYS`, the same days in order.
  Each day has `prev`/`next` and a list of groups; each group has a name and
  tasks. A task carries
  type, title, start time, duration, done/launchable flags, and optionally
  `notes` (rich text as blocks of runs, supporting bold and links), an `intro`
  (the four Prep Map Point Intro fields), or `embeds` — workout and routine cards.

`lib/plan.ts` derives everything else, so no computed value is stored twice:
date formatting, `planFraction` / `phaseWidth` for the strip,
`dayProgress` / `groupProgress` for the counters, `earliestIncomplete` for the
resume banner, and `firstDayOfPhase` / `firstIncompleteDayOfPhase`. The PRD gives
the strip and the rail selector different jump targets ("that plan's first day"
against "that plan's first incomplete day"); with the selector gone the strip
uses the second, and the first stays as its fallback for a plan whose days are
not in the fixture.

Date math uses noon timestamps so that time zones cannot shift a day.

## What is live and what is stubbed

Live:

- Checking tasks off, including group auto-collapse when a group completes and
  auto-expand when it is reopened.
- Day paging: chevrons and Today beside the date, the bottom pager, and the date
  dropdown with a per-day donut.
- The plan strip: hover tooltips on segments and mile markers, clicking a segment
  jumps to that plan's first incomplete day, Today sits at its proportional
  position.
- Bookmarking a card inside a task's notes adds it to My Workouts or My Routines,
  by card kind. The current stage's routine starts on the shelf.
- The resume banner recomputes from current state and disappears when today is
  finished.

Stubbed, and labeled as such in the UI:

- Weekly and Full Plan tabs are rendered and disabled.
- Adjust Plan, Start / Continue, and the launch arrow raise a toast naming what
  would open (Study Plan Settings, focus mode).
- Links inside notes and in Video Course Review point at `#`. Concept Review
  shows the system's real gating treatment (`lh-link-lock`).
- No backend and no persistence: state resets on reload.
- Mile markers are a literal array. The PRD derives them from the schedule (first
  task of a given type); there are only three days of schedule here to derive
  from, so the array stands in. On real data it becomes a query, and the set and
  order of markers do not change.

## Open questions for your team

**My Routines looks derived, not curated.** The PRD asks the student to bookmark
Routines and Workouts to fill the rail's shelves. But a Routine card says "run
before every set" — the plan schedules those sets, so it already puts the card in
front of the student every time it is relevant. What is left for the bookmark to
solve is the one case where the shelf earns its place: the routine the current
Prep Stage is built around, which a student drills for weeks. And the platform
knows which routine that is — the stage defines it. Asking the student to file it
by hand is the same shape as deriving mile markers from a literal array instead
of from the schedule: a value the system holds, entered manually.

There is also a tension with the surface's own thesis. The screen exists to
remove doors — the beta complaint was "I feel overwhelmed, I don't know where to
go" — and a shelf of self-selected shortcuts is a door. Empty, which is its
default state, it spends the bottom half of the rail explaining a mechanic
instead of showing content.

In this build the current stage's routine starts on the shelf, so the section
shows the state in which it makes sense rather than an empty box with
instructions. Worth deciding whether the manual control should exist at all.


These are discrepancies inside the source system that had to be resolved one way
or another to build the screen. Each is reproduced as found and flagged in the
code.

1. **Border weight.** The Stat point card is drawn with a 1.5px border while
   `Label` and `Section_Label` use 2px. Which is correct for new work?
2. **Two type scales.** v1 (`body-large`/`body-medium`/`body-small`) and v2.0
   (`body-xl`…`body-xs`) both ship in the product. This screen uses v2.0
   throughout except for the Stat point caption, which the design file marks as
   Body 3 (16/24) — a size v2.0 does not contain. Should new screens stay on v2.0
   only, and does that caption need a v2.0 equivalent?
3. **v2.0 line height.** Figma sets a 1.6 multiplier; production CSS sets 137.5%.
   Production won here. Which is the source of truth?
4. **Two renders of `stat-point/time-range`.** The component is drawn one way on
   its own and another way inside the Stat point card. The in-card render was
   used (unfilled track, Current on seafoam-lc). Which one is canonical?
5. **Rail width.** `--sidebar-width: 300px` is app navigation rather than a
   content rail, and `--max-width-component: 1080px` is a marketing page width at
   which the task row stretches and hollows out in the middle. This build uses
   its own `--study-rail-width: 220px` and `--study-surface-width: 940px`, closer
   to production's 171 / 493 / 678. Is there an existing token for the content
   rail that was missed?
6. **`Section_Label` is still on the 1.0 schema** (label, counter, progress bar,
   duration) while the task row has moved to 1.1. The group header here was
   brought in line with 1.1 (counter and round button). Is a 1.1 variant of
   `Section_Label` planned?
