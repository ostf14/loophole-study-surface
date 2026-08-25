"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { IconButton } from "@/components/ui/icon-button";
import { PositionIcon } from "@/components/ui/position-icon";
import { ProgressBar } from "@/components/ui/progress-bar";

/** Служебная страница для сверки примитивов с системой. В выдачу не входит. */

export default function KitchenSink() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);

  return (
    <main className="mx-auto flex w-full max-w-[900px] flex-col gap-10 p-14">
      <h1 className="text-display-m">Примитивы</h1>

      <Row title="Checkbox — поворот 8°, масштаб 0.786 → 1, рамка 2 → 3px">
        <Checkbox checked={a} onCheckedChange={setA} label="Первая задача" />
        <Checkbox checked={b} onCheckedChange={setB} label="Вторая задача" />
        <Checkbox checked={false} onCheckedChange={() => {}} label="Выключен" disabled />
        <Checkbox checked={false} onCheckedChange={() => {}} label="Частично" indeterminate />
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
