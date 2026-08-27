"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, Play } from "lucide-react";
import { StatPoint } from "@/components/stat-point/stat-point";
import { TimeRange } from "@/components/stat-point/time-range";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CHECKBOX_ROTATIONS, Checkbox } from "@/components/ui/checkbox";
import { IconButton } from "@/components/ui/icon-button";
import { PositionIcon } from "@/components/ui/position-icon";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ProgressBarLong } from "@/components/ui/progress-bar-long";

/**
 * Галерея примитивов: каждый компонент во всех состояниях, которые он умеет,
 * рядом друг с другом. Экран показывает их по одному в работе, здесь они
 * видны разом — так проще сверить их с файлом Figma и заметить состояние,
 * которое на экране не встречается.
 */

export default function KitchenSink() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);
  const [rot, setRot] = useState<Record<string, boolean>>({});

  return (
    <main className="mx-auto flex w-full max-w-[900px] flex-col gap-10 p-14">
      <h1 className="text-display-m">Primitives</h1>

      <Row title="Checkbox — no tilt, sizes default and small">
        <Checkbox checked={a} onChange={(e) => setA(e.target.checked)} aria-label="First" />
        <Checkbox checked={b} onChange={(e) => setB(e.target.checked)} aria-label="Second" />
        <Checkbox checked={false} onChange={() => {}} disabled aria-label="Disabled" />
        <Checkbox checked={false} onChange={() => {}} indeterminate aria-label="Indeterminate" />
        <Checkbox size="small" checked={b} onChange={(e) => setB(e.target.checked)} aria-label="Small" />
        <Checkbox color="seafoam" checked={b} onChange={(e) => setB(e.target.checked)} aria-label="Seafoam" />
      </Row>

      <Row title="Checkbox — the five tilts in CHECKBOX_ROTATIONS">
        {CHECKBOX_ROTATIONS.map((r) => (
          <span key={r} className="flex flex-col items-center gap-2">
            <Checkbox
              rotation={r}
              checked={rot[r] ?? true}
              onChange={(e) => setRot((s) => ({ ...s, [r]: e.target.checked }))}
              aria-label={r}
            />
            <span className="text-tag-s text-pewter-hc">{r}</span>
          </span>
        ))}
      </Row>

      <Row title="Checkbox with a label slot, gap 20">
        <Checkbox
          checked={a}
          onChange={(e) => setA(e.target.checked)}
          label={<span className="text-body-small font-extrabold">Basic Translation Drill</span>}
        />
      </Row>

      <Row title="PositionIcon — Default / During / Complete, 30 and 24">
        <PositionIcon n={1} state="default" />
        <PositionIcon n={2} state="during" />
        <PositionIcon n={3} state="complete" />
        <PositionIcon n={4} state="default" size="small" />
        <PositionIcon n={5} state="during" size="small" />
        <PositionIcon n={6} state="complete" size="small" />
      </Row>

      <Row title="IconButton — 38×38 with a 24 icon, plus the 32 and 24 instances">
        <IconButton icon={<ArrowRight />} label="Launch" />
        <IconButton icon={<ChevronDown />} label="Expand" />
        <IconButton icon={<Play />} label="Play" />
        <IconButton size="sm" icon={<ArrowRight />} label="Launch, 32" />
        <IconButton size="xs" icon={<ArrowRight />} label="Launch, 24" />
      </Row>

      <Row title="ProgressBar — the right edge stays square until a hundred per cent">
        <ProgressBar value={0} max={9} />
        <ProgressBar value={3} max={9} />
        <ProgressBar value={9} max={9} />
      </Row>

      <Row title="Button — primary / secondary / ghost">
        <Button variant="primary">Start</Button>
        <Button variant="secondary" icon={<ChevronDown className="size-4" />}>
          Adjust Plan
        </Button>
        <Button variant="secondary" iconSide="leading" icon={<Play className="size-4" />}>
          Leading
        </Button>
        <Button variant="ghost">Lookup</Button>
        <Button variant="primary" disabled>
          Locked
        </Button>
      </Row>

      <Row title="Card — the house hover, sm / md / lg">
        <Card hover="sm" className="px-5 py-3 text-body-small font-extrabold">
          hover sm
        </Card>
        <Card hover="md" className="px-5 py-3 text-body-small font-extrabold">
          hover md
        </Card>
        <Card hover="lg" className="px-5 py-3 text-body-small font-extrabold">
          hover lg
        </Card>
      </Row>

      <Row title="Progress bar/long-bar — track, slot separators, fill, counter">
        <div className="flex w-full max-w-[420px] flex-col gap-6">
          <ProgressBarLong value={0.42} slots={8} label="42% complete" />
          <ProgressBarLong value={0.42} slots={8} counter={3} label="3 of 8" />
          <ProgressBarLong value={1} slots={8} counter={8} label="all complete" />
          <ProgressBarLong value={0} slots={8} label="nothing complete" />
        </div>
      </Row>

      <Row title="stat-point/time-range — Default with deltas, No Deltas, regression">
        <div className="flex w-full max-w-[420px] flex-col gap-6">
          <TimeRange
            start="38:10"
            current="31:40"
            goal="25:00"
            deltaToStart="6:30"
            deltaToGoal="6:40"
          />
          <TimeRange start="38:10" current="31:40" goal="25:00" />
          <TimeRange
            start="31:40"
            current="34:20"
            goal="25:00"
            deltaToStart="2:40"
            deltaToGoal="9:20"
            regressed
          />
        </div>
      </Row>

      <Row title="Stat point — 300×156 card, 1.5px border, 6px hover">
        <StatPoint label="Translation + CLIR, RC" hover>
          <TimeRange
            start="38:10"
            current="31:40"
            goal="25:00"
            deltaToStart="6:30"
            deltaToGoal="6:40"
          />
        </StatPoint>
      </Row>

      <Row title="Type — the v2.0 scale; tracking is negative throughout">
        <div className="flex flex-col gap-1">
          <span className="text-display-m">Display M 32/800</span>
          <span className="text-title-medium">Title Medium 24/700</span>
          <span className="text-body-xl font-extrabold">Body XL 20 Bold — group header</span>
          <span className="text-body-small font-extrabold">Body 3 · 16/24 · 800 — task title</span>
          <span className="text-body-s">Body S 14 — submenu</span>
          <span className="text-body-xs text-pewter-hc">Body XS 12 — time and captions</span>
          <span className="text-caption-medium">Caption Medium 12/600</span>
          <span className="text-tag">TAG 12/800</span>
        </div>
      </Row>
    </main>
  );
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-body-small font-extrabold text-soft-black">{title}</h2>
      <div className="flex flex-wrap items-center gap-6">{children}</div>
    </section>
  );
}
