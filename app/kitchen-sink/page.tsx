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

/** Служебная страница для сверки примитивов с системой. В выдачу не входит. */

export default function KitchenSink() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);
  const [rot, setRot] = useState<Record<string, boolean>>({});

  return (
    <main className="mx-auto flex w-full max-w-[900px] flex-col gap-10 p-14">
      <h1 className="text-display-m">Примитивы</h1>

      <Row title="Checkbox — дефолт без наклона, размеры default и small">
        <Checkbox checked={a} onChange={(e) => setA(e.target.checked)} aria-label="Первая" />
        <Checkbox checked={b} onChange={(e) => setB(e.target.checked)} aria-label="Вторая" />
        <Checkbox checked={false} onChange={() => {}} disabled aria-label="Выключен" />
        <Checkbox checked={false} onChange={() => {}} indeterminate aria-label="Частично" />
        <Checkbox size="small" checked={b} onChange={(e) => setB(e.target.checked)} aria-label="Маленький" />
        <Checkbox color="seafoam" checked={b} onChange={(e) => setB(e.target.checked)} aria-label="Seafoam" />
      </Row>

      <Row title="Checkbox — пять вариантов наклона из CHECKBOX_ROTATIONS">
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

      <Row title="Checkbox со слотом лейбла, gap-5">
        <Checkbox
          checked={a}
          onChange={(e) => setA(e.target.checked)}
          label={<span className="text-body-m font-bold">Basic Translation Drill</span>}
        />
      </Row>

      <Row title="PositionIcon — Default / During / Complete, 30 и 24">
        <PositionIcon n={1} state="default" />
        <PositionIcon n={2} state="during" />
        <PositionIcon n={3} state="complete" />
        <PositionIcon n={4} state="default" size="small" />
        <PositionIcon n={5} state="during" size="small" />
        <PositionIcon n={6} state="complete" size="small" />
      </Row>

      <Row title="IconButton — 32×32, иконка 20×20">
        <IconButton icon={<ArrowRight />} label="Запустить" />
        <IconButton icon={<ChevronDown />} label="Развернуть" />
        <IconButton icon={<Play />} label="Играть" />
      </Row>

      <Row title="ProgressBar — правый край прямой до ста процентов">
        <ProgressBar value={0} max={9} />
        <ProgressBar value={3} max={9} />
        <ProgressBar value={9} max={9} />
      </Row>

      <Row title="Button — primary / secondary / ghost">
        <Button variant="primary">Start</Button>
        <Button variant="secondary">
          Adjust Plan <ChevronDown className="size-4" />
        </Button>
        <Button variant="ghost">Lookup</Button>
        <Button variant="primary" disabled>
          Locked
        </Button>
      </Row>

      <Row title="Card — фирменное движение, sm / md / lg">
        <Card hover="sm" className="px-5 py-3 text-body-m font-bold">
          hover sm
        </Card>
        <Card hover="md" className="px-5 py-3 text-body-m font-bold">
          hover md
        </Card>
        <Card hover="lg" className="px-5 py-3 text-body-m font-bold">
          hover lg
        </Card>
      </Row>

      <Row title="stat-point/time-range — Default с дельтами, No Deltas, регрессия">
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

      <Row title="Stat point — карточка 300×156, рамка 1.5px, hover 6px">
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

      <Row title="Типографика — шкала v2.0, трекинг отрицательный везде">
        <div className="flex flex-col gap-1">
          <span className="text-display-m">Display M 32/800</span>
          <span className="text-title-medium">Title Medium 24/700</span>
          <span className="text-body-xl font-bold">Body XL 20 Bold — заголовок группы</span>
          <span className="text-body-m font-bold">Body M 16 Bold — заголовок задачи</span>
          <span className="text-body-s">Body S 14 — подменю</span>
          <span className="text-body-xs text-pewter-hc">Body XS 12 — время и подписи</span>
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
      <h2 className="text-caption-medium uppercase text-pewter-hc">{title}</h2>
      <div className="flex flex-wrap items-center gap-6">{children}</div>
    </section>
  );
}
