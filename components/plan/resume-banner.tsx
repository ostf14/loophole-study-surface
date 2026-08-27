"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressDonut } from "@/components/ui/progress-donut";
import { TaskIcon } from "@/components/day/task-icon";
import { formatShort } from "@/lib/plan";
import type { Task } from "@/lib/plan-data";

/**
 * Resume-баннер. Единственное первичное действие страницы: самая ранняя
 * незавершённая задача и запуск в один клик. PRD прячет баннер, когда всё до
 * сегодняшнего дня выполнено, поэтому отсутствие задачи означает отсутствие
 * блока.
 *
 * Точного компонента под него в системе нет — элемент из PRD, а не из
 * существующего продукта. Геометрия взята у `Training Block` со страницы Bars,
 * снятого через Figma REST: радиус 24, паддинг 40 по вертикали и 24 по
 * горизонтали, обводка 2px, тени нет. Внутри ряд с гэпом 24: слева донат 32
 * и текстовый столбец с гэпом 8, справа кнопка 48 высотой с трейлинг-иконкой.
 * Заголовок `Display type/Title 2` — Inter 800, 24/34. Строка метаданных
 * с гэпом 16 из двух блоков.
 *
 * Цвета намеренно не взяты: `Training Block` залит sangria-lc, а баннер стоит
 * внутри шапки на turquoise-lc, и розовая полоса там читалась бы как чужая.
 *
 * Два отступления от геометрии, оба ради ритма страницы. Вертикальный паддинг
 * 24 вместо 40: `Training Block` — самостоятельный блок на контентной странице,
 * а наш баннер третий блок в постоянной шапке, и на сорока она занимала
 * шестьдесят два процента высоты окна.
 *
 * И роли текста переставлены. В `Training Block` двадцатичетвёртым кеглем
 * набрано имя блока, то есть содержание. У нас там стояло «Jump back in!» —
 * подпись, а сама задача шла мелко под ней. Теперь наоборот: подпись мелким
 * капсом, заголовок задачи крупно.
 *
 * Компонентами `Alert/Alert Bar` и `Action Bar` баннер не собран сознательно.
 * Первый — уведомление о проблеме с кнопкой отката и крестиком закрытия,
 * второй — футер потока с горячей клавишей. Обоим здесь не место: баннер
 * зовёт продолжить, а не сообщает, что что-то пошло не так.
 */

type ResumeBannerProps = {
  task: Task;
  date: string;
  today: string;
  onStart: () => void;
};

/**
 * Доля пройденного у начатой задачи: из «25m» и «12m left». Возвращает null,
 * когда считать нечего, — тогда донат не рисуется вовсе.
 *
 * Раньше в этом случае он рисовался пустым кольцом: задача одна, закрашивать
 * нечего, и элемент занимал место, ничего не сообщая. Теперь в слоте стоит
 * иконка типа задачи — та же, что в строках списка. Слот говорит либо
 * «ты прошёл столько-то», либо «вот что это за задача», но не молчит.
 */
function progress(task: Task) {
  const total = Number.parseInt(task.duration, 10);
  const left = task.remaining ? Number.parseInt(task.remaining, 10) : Number.NaN;
  if (!task.started || Number.isNaN(total) || Number.isNaN(left) || total <= 0) return null;
  return { done: total - left, total };
}

export function ResumeBanner({ task, date, today, onStart }: ResumeBannerProps) {
  const later = date > today;
  const p = progress(task);

  return (
    <div className="flex flex-wrap items-center gap-6 rounded-3xl border-[2px] border-soft-black bg-soft-white px-6 py-6">
      {/*
       * Сетка, а не два вложенных ряда. Слот прогресса стоит в первой колонке
       * второго ряда, подпись и заголовок — во второй; выравнивание по верху
       * ряда, как в `Training Block`, где Progress 32 и заголовок 24/34 стоят
       * вровень (`counter: MIN`).
       *
       * Раньше слот лежал в одном ряду с колонкой из двух строк и центрировался
       * по ней целиком — то есть висел между «Jump back in!» и названием, не
       * принадлежа ни тому, ни другому. А показывает он прогресс именно
       * названной задачи.
       */}
      <div className="grid min-w-0 flex-1 basis-[280px] grid-cols-[auto_1fr] items-start gap-x-4 gap-y-2">
        <span className="col-start-2 text-caption-medium uppercase text-pewter-hc">
          Jump back in!
        </span>

        <span className="col-start-1 row-start-2 flex">
          {p ? (
            <ProgressDonut
              done={p.done}
              total={p.total}
              size={32}
              label={`${p.done} of ${p.total} minutes done`}
            />
          ) : (
            <TaskIcon type={task.type} className="size-[28px] shrink-0 text-soft-black" />
          )}
        </span>

        {/* Пока строка помещается, длительность стоит справа от названия
            на общей базовой линии; когда перестаёт — уходит под него.
            Иначе `truncate` отдавал всю ширину неразрывной длительности
            и съедал название целиком. */}
        <span className="col-start-2 row-start-2 flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
          <span className="truncate text-title-medium font-extrabold">{task.title}</span>
          <span className="shrink-0 text-body-s text-pewter-hc">
            {task.started ? task.remaining : task.duration}
            {later ? ` · ${formatShort(date)}` : null}
          </span>
        </span>
      </div>

      <Button
        variant="primary"
        onClick={onStart}
        className="shrink-0"
        icon={<ArrowUpRight className="size-[28px]" strokeWidth={2.5} />}
      >
        {task.started ? "Continue" : "Start"}
      </Button>
    </div>
  );
}
