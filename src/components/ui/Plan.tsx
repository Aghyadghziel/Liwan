import type { Locale } from '@/lib/i18n';
import { PLAN } from '@/lib/villa/geometry';

/**
 * The ground floor, drawn from the same numbers the 3D model is built from — so the plan and
 * the house can never disagree. Ink on paper, because that is how a plan is read.
 */

const PAD = 6;
const MIN_X = PLAN.west - PAD;
const MAX_X = PLAN.east + PAD;
const MIN_Z = PLAN.north - PAD;
const MAX_Z = PLAN.deck.z1 + 1;
const SCALE = 20;

const x = (value: number) => (value - MIN_X) * SCALE;
const y = (value: number) => (value - MIN_Z) * SCALE;
const w = (from: number, to: number) => (to - from) * SCALE;

const LABELS = [
  { x: -9.6, z: 0.2, ar: 'البهو', en: 'FOYER' },
  { x: -3.4, z: -4.6, ar: 'المعيشة', en: 'LIVING' },
  { x: 7.4, z: -2.6, ar: 'المطبخ', en: 'KITCHEN' },
  { x: 1.1, z: -0.9, ar: 'الطعام', en: 'DINING' },
  { x: -7, z: 9.5, ar: 'الشرفة', en: 'TERRACE' },
  { x: 3.5, z: 13.3, ar: 'المسبح', en: 'POOL' },
  { x: -14.3, z: -6.6, ar: 'الرواق', en: 'PORTICO' },
];

export function Plan({ className, locale = 'en' }: { className?: string; locale?: Locale }) {
  const wall = PLAN.wall * SCALE;
  const ar = locale === 'ar';

  return (
    <figure className={className}>
      <svg
        viewBox={`0 0 ${w(MIN_X, MAX_X)} ${w(MIN_Z, MAX_Z)}`}
        className="w-full bg-paper"
        role="img"
        aria-label={ar ? 'مسقط الدور الأرضي: البهو والمعيشة والمطبخ والشرفة والمسبح' : 'Ground floor plan: foyer, living, kitchen, terrace and pool'}
      >
        <g fill="none" stroke="#0e0f10">
          {/* Terrace and pool, drawn thin: landscape is a lighter line than building. */}
          <rect x={x(PLAN.deck.x0)} y={y(PLAN.deck.z0)} width={w(PLAN.deck.x0, PLAN.deck.x1)} height={w(PLAN.deck.z0, PLAN.deck.z1)} strokeWidth={1} opacity={0.35} />
          <rect x={x(PLAN.pool.x0)} y={y(PLAN.pool.z0)} width={w(PLAN.pool.x0, PLAN.pool.x1)} height={w(PLAN.pool.z0, PLAN.pool.z1)} strokeWidth={1.5} fill="#0e0f10" fillOpacity={0.07} />

          {/* Poché: walls drawn as solid thickness, the way a plan is cut. */}
          <g fill="#0e0f10" stroke="none">
            <rect x={x(PLAN.west) - wall / 2} y={y(PLAN.north) - wall / 2} width={w(PLAN.west, PLAN.east) + wall} height={wall} />
            <rect x={x(PLAN.west) - wall / 2} y={y(PLAN.north)} width={wall} height={w(PLAN.north, PLAN.south)} />
            <rect x={x(PLAN.east) - wall / 2} y={y(PLAN.north)} width={wall} height={w(PLAN.north, PLAN.south)} />
            <rect x={x(PLAN.west) - wall / 2} y={y(PLAN.south) - wall / 2} width={w(PLAN.west, PLAN.foyerEast) + wall} height={wall} />
            {/* Interior partitions, thinner. */}
            <rect x={x(PLAN.foyerEast) - wall / 4} y={y(PLAN.north)} width={wall / 2} height={w(PLAN.north, PLAN.north + 8)} />
            <rect x={x(PLAN.kitchenWest) - wall / 4} y={y(PLAN.north)} width={wall / 2} height={w(PLAN.north, PLAN.north + 6)} />
          </g>

          {/* The glazed south face: a double line, as glazing is drawn. */}
          <g stroke="#0e0f10" strokeWidth={1.2}>
            <line x1={x(PLAN.foyerEast)} y1={y(PLAN.south) - 2} x2={x(PLAN.east)} y2={y(PLAN.south) - 2} />
            <line x1={x(PLAN.foyerEast)} y1={y(PLAN.south) + 2} x2={x(PLAN.east)} y2={y(PLAN.south) + 2} />
          </g>

          {/* Roof overhang, dashed, because it is above the cut. */}
          <rect
            x={x(PLAN.west - 1.5)}
            y={y(PLAN.north - 1.5)}
            width={w(PLAN.west - 1.5, PLAN.east + 1.5)}
            height={w(PLAN.north - 1.5, PLAN.south + 1.5)}
            strokeWidth={0.8}
            strokeDasharray="6 5"
            opacity={0.5}
          />

          {/* Portico */}
          <rect x={x(PLAN.west - 4.6)} y={y(-5.95)} width={w(0, 4.6)} height={w(0, 9.5)} strokeWidth={0.8} strokeDasharray="6 5" opacity={0.5} />

          {/* Furniture, as single lines: enough to read the plan, not a drawing of sofas. */}
          <g strokeWidth={1} opacity={0.55}>
            <rect x={x(-4.7)} y={y(1.3)} width={w(0, 4.2)} height={w(0, 1.05)} />
            <rect x={x(-1.3)} y={y(2.6)} width={w(0, 1.05)} height={w(0, 2.2)} />
            <rect x={x(-3.55)} y={y(2.7)} width={w(0, 1.9)} height={w(0, 0.9)} />
            <rect x={x(-0.25)} y={y(-2.75)} width={w(0, 2.7)} height={w(0, 1.1)} />
            <rect x={x(5.6)} y={y(0.15)} width={w(0, 3.6)} height={w(0, 1.1)} />
            <rect x={x(3.9)} y={y(-5.72)} width={w(0, 7)} height={w(0, 0.64)} />
          </g>

          {/* Stair */}
          <g strokeWidth={0.8} opacity={0.6}>
            {Array.from({ length: 12 }, (_, index) => (
              <line key={index} x1={x(1.35)} y1={y(-3.75 - index * 0.25)} x2={x(2.85)} y2={y(-3.75 - index * 0.25)} />
            ))}
          </g>
        </g>

        {/* Labels */}
        <g fill="#0e0f10" fontSize={ar ? 14 : 11} letterSpacing={ar ? 0 : 2.4} textAnchor="middle" fontFamily="var(--font-head)">
          {LABELS.map((label) => (
            <text key={label.en} x={x(label.x)} y={y(label.z)} direction={ar ? 'rtl' : 'ltr'}>
              {ar ? label.ar : label.en}
            </text>
          ))}
        </g>

        {/* Dimension line across the front, and north. */}
        <g stroke="#0e0f10" strokeWidth={0.8} opacity={0.6}>
          <line x1={x(PLAN.west)} y1={y(MAX_Z - 1.4)} x2={x(PLAN.east)} y2={y(MAX_Z - 1.4)} />
          <line x1={x(PLAN.west)} y1={y(MAX_Z - 1.8)} x2={x(PLAN.west)} y2={y(MAX_Z - 1)} />
          <line x1={x(PLAN.east)} y1={y(MAX_Z - 1.8)} x2={x(PLAN.east)} y2={y(MAX_Z - 1)} />
        </g>
        <text x={x(0)} y={y(MAX_Z - 1.9)} fill="#0e0f10" fontSize={11} letterSpacing={2} textAnchor="middle" fontFamily="var(--font-jost)">
          24.00
        </text>
        <g transform={`translate(${x(PLAN.east + 3.4)}, ${y(PLAN.north - 3.6)})`}>
          <line x1={0} y1={14} x2={0} y2={-14} stroke="#0e0f10" strokeWidth={0.8} />
          <path d="M 0 -18 L 4 -8 L 0 -11 L -4 -8 Z" fill="#0e0f10" />
          <text x={0} y={26} fill="#0e0f10" fontSize={10} letterSpacing={2} textAnchor="middle" fontFamily="var(--font-jost)">
            N
          </text>
        </g>
      </svg>
    </figure>
  );
}
