import { Compare } from "@/components/stat-point/compare";
import { StatPoint } from "@/components/stat-point/stat-point";
import { TimeRange } from "@/components/stat-point/time-range";
import { GOALS, type Goal } from "@/lib/plan-data";

/**
 * Next Goal. Обе цели собраны карточками `Stat point` со страницы Stats —
 * это их контейнер ровно под такое: стата сверху, подпись «что измеряем»
 * снизу.
 *
 * Раньше здесь была каша: слева свободный ряд квадратиков, справа обведённый
 * `time-range` со своей шапкой, четыре разные отбивки по левому краю и вдвое
 * разный вес у двух строк. Причём `time-range` мы вынули как раз из `Stat
 * point` и поставили голым — компонент нарисован жить внутри карточки.
 *
 * Типы статы взяты из свойства `Type` того же компонента:
 *
 *   RC — `Visual Gauge`, то есть `stat-point/time-range`: бегущее число
 *        против фиксированной цели.
 *   LR — `Compare`, дробь «сделано из всего». Критерий звучит «get every
 *        conditional question right», а сколько условных вопросов в секции —
 *        заранее неизвестно, оно плавает. Значит честная форма именно дробь.
 *
 * `Heatmap` для LR не взят сознательно: он кодирует величину, оттенки в нём
 * шкала интенсивности, а у нас состояние бинарное — вопрос либо чистый, либо
 * сорванный. Два значения из градиента выглядели бы похоже и читались бы
 * неверно.
 *
 * Подпись карточки расширена до двух строк: PRD требует и название цели,
 * и критерий словами, а в компоненте слот один.
 *
 * PRD ставит модуль наверх day timeline и требует по строке на секцию, когда
 * LR и RC стоят на разных ступенях.
 */

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function NextGoal() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-caption-medium uppercase text-pewter-hc">Next Goal</h2>

      <div className="grid grid-cols-2 gap-4">
        {GOALS.map((goal) => (
          <StatPoint
            key={goal.section}
            className="w-full"
            gap={goal.kind === "gate" ? 6 : 13}
            label={
              <>
                <span className="block font-bold text-soft-black">
                  {goal.section} · {goal.name}
                </span>
                <span className="block">{goal.criterion}</span>
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
   * Вариант No Deltas. Default требует около 280 на собственное содержимое,
   * то есть карточку от 336; в колонке 600 на две карточки приходится по 292,
   * и дельты сжимались бы — flex ужимает их молча, без переполнения, ломая
   * снятую из файла геометрию. Три точки сообщают то же самое, а расстояние
   * до цели читается из самих чисел.
   */
  return (
    <TimeRange
      start={mmss(goal.startSeconds)}
      current={mmss(goal.currentSeconds)}
      goal={mmss(goal.targetSeconds)}
    />
  );
}
