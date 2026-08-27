import { cn } from "@/lib/cn";

/**
 * `Progress bar/long-bar` со страницы Progress, снят через Figma REST.
 *
 * Устройство из трёх слоёв:
 *
 *   1. Дорожка — 241×36, радиус 8, заливка sand, обводка 2.647 внутрь
 *      и жёсткая тень 3.97/3.97. Это тот же вес, что у сегментов Prep Map:
 *      обводка 2.647 у них общая, компоненты одного семейства.
 *   2. Разделители — прямоугольники 2×14, радиус 48, разложены по ширине
 *      с равным шагом. Цвет в компоненте сырой `#d9d9d9`, ни переменной,
 *      ни стиля за ним нет; по умолчанию взят pewter, ближайший токен. По краям стоят ещё два нулевой
 *      прозрачности, они держат раскладку `space-between`. Есть второй режим,
 *      `separatorSpan="full"`: та же палочка во всю внутреннюю высоту дорожки
 *      и без скругления — тогда она читается границей, а не засечкой.
 *   3. Заполнение — растянутый `Progress bar/Ticks`: радиус 6, обводка 2.647,
 *      заливка turquoise поверх sand, собственная тень 3/3. Незаполненные
 *      слоты в макете лежат прозрачными заглушками, сквозь них видны
 *      разделители.
 *
 * Счётчик — отдельный инстанс `Counter` 24×24: радиус полный, заливка
 * soft-white, обводка 2px, текст Inter 800 11/13.31 с трекингом -0.11.
 * Сидит внутри заполненной части, отступив от её правого края.
 *
 * Все производные размеры считаются от высоты дорожки: в компоненте она 36,
 * и от неё берутся радиусы, обводка, тени и габарит счётчика.
 */

type ProgressBarLongProps = {
  /** Доля заполнения от нуля до единицы. */
  value: number;
  /** Сколько слотов делят дорожку. В компоненте восемь, шаг равный. */
  slots?: number;
  /**
   * Доли от нуля до единицы, где стоят разделители. Задаются вместо `slots`,
   * когда деления неравные — например, фазы плана по диапазону дат.
   */
  separators?: number[];
  /** Число в кружке у правого края заполнения. Без него кружка нет. */
  counter?: number | string;
  /** Высота дорожки. В компоненте 36, всё остальное считается от неё. */
  height?: number;
  /**
   * Поднимать ли заполнение тенью, как это делает компонент. Верно, когда
   * заполнение идёт слотами; для сплошного отрезка выключается.
   */
  raised?: boolean;
  /**
   * Цвет разделителей. В компоненте стоит сырой `#d9d9d9` — во всём файле он
   * ни разу не переменная и ни разу не стиль, это фигмовский серый по
   * умолчанию, тот же класс, что `#aaaaaa` у времени задачи. По умолчанию
   * взят ближайший к нему токен палитры, pewter. На дорожке ниже 36 он тонет
   * в песочной заливке, поэтому задаётся на месте использования.
   */
  separatorColor?: string;
  /**
   * Насколько высок разделитель. `component` — 14 при высоте дорожки 36, как
   * в файле. `full` — от обводки до обводки, встык, и без скругления концов:
   * засечка посередине читается меткой на дорожке и сталкивается со всем, что
   * на дорожке стоит, а линия во всю высоту читается границей.
   */
  separatorSpan?: "component" | "full";
  className?: string;
  label?: string;
};

export function ProgressBarLong({
  value,
  slots = 8,
  separators,
  counter,
  height = 36,
  raised = true,
  separatorColor = "var(--color-pewter)",
  separatorSpan = "component",
  className,
  label,
}: ProgressBarLongProps) {
  const k = height / 36;
  const stroke = 2.647 * k;
  const trackRadius = 8 * k;
  const fillRadius = 6 * k;
  const trackLift = 3.97 * k;
  const fillLift = 3 * k;
  const counterSize = 24 * k;
  const full = separatorSpan === "full";
  const separatorH = full ? height - stroke * 2 : 14 * k;
  const separatorRadius = full ? 0 : 48 * k;

  const pct = Math.min(Math.max(value, 0), 1) * 100;

  return (
    <div
      className={cn("relative", className)}
      style={{ height: height + trackLift }}
      role="img"
      aria-label={label ?? `${Math.round(pct)}% complete`}
    >
      {/* дорожка */}
      <div
        className="absolute inset-x-0 top-0 bg-sand"
        style={{
          height,
          borderRadius: trackRadius,
          border: `${stroke}px solid var(--color-soft-black)`,
          boxShadow: `${trackLift}px ${trackLift}px 0 0 var(--color-soft-black)`,
        }}
      />

      {/* разделители слотов */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center" style={{ height }}>
        {(separators ?? Array.from({ length: slots - 1 }, (_, i) => (i + 1) / slots)).map((at, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              backgroundColor: separatorColor,
              left: `${at * 100}%`,
              width: 2 * k,
              height: separatorH,
              borderRadius: separatorRadius,
              transform: "translateX(-50%)",
            }}
          />
        ))}
      </div>

      {/*
        Заполнение. В компоненте это `Items completed` — ряд приподнятых
        ячеек: у каждой своя обводка и своя тень 3/3, потому что заполненный
        слот там объект, а не отрезок. Сплошная заливка приподнятой быть не
        может: одна плашка с тенью на всю пройденную часть читается не
        заполнением дорожки, а чужим элементом, положенным сверху.

        Поэтому `raised` включает подъём только там, где заполнение идёт
        слотами. Сплошное садится внутрь дорожки: обводки нет вовсе — её роль
        уже играет обводка самой дорожки, — а скругление левого края повторяет
        внутренний радиус дорожки, правый край остаётся почти прямым, чтобы
        было видно, что это край заполнения, а не край объекта.
      */}
      {pct > 0 ? (
        <div
          className="absolute bg-turquoise"
          style={
            raised
              ? {
                  top: 0,
                  left: 0,
                  width: `${pct}%`,
                  height,
                  borderRadius: fillRadius,
                  border: `${stroke}px solid var(--color-soft-black)`,
                  boxShadow: `${fillLift}px ${fillLift}px 0 0 var(--color-soft-black)`,
                }
              : {
                  top: stroke,
                  left: stroke,
                  width: `calc(${pct}% - ${stroke}px)`,
                  height: height - stroke * 2,
                  borderRadius: `${trackRadius - stroke}px ${2 * k}px ${2 * k}px ${trackRadius - stroke}px`,
                }
          }
        >
          {counter !== undefined ? (
            <span
              className="absolute inline-flex items-center justify-center rounded-full border-[2px] border-soft-black bg-soft-white text-soft-black"
              style={{
                width: counterSize,
                height: counterSize,
                right: 6 * k,
                top: (height - counterSize) / 2,
                fontSize: 11 * k,
                lineHeight: `${13.31 * k}px`,
                fontWeight: 800,
                letterSpacing: `${-0.11 * k}px`,
              }}
            >
              {counter}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
