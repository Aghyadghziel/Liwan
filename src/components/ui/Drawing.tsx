import type { DrawingId } from '@/content/site';
import type { Locale } from '@/lib/i18n';
import { Plan } from './Plan';

/**
 * Schematic drawings, one per project, in one line language: walls cut solid, landscape in a
 * thinner line, anything above the cut dashed, trees as circles. They are diagrams of the
 * idea — each page says so — not construction drawings.
 */

const INK = '#0e0f10';
const PAPER = '#f4f1ec';

type Label = { x: number; y: number; ar: string; en: string; light?: boolean };

function Labels({ items, locale }: { items: Label[]; locale: Locale }) {
  return (
    <g fontSize={locale === 'ar' ? 13 : 10.5} letterSpacing={locale === 'ar' ? 0 : 2.2} textAnchor="middle" fontFamily="var(--font-head)">
      {items.map((item) => (
        <text key={`${item.x}-${item.y}`} x={item.x} y={item.y} fill={item.light ? PAPER : INK} direction={locale === 'ar' ? 'rtl' : 'ltr'}>
          {locale === 'ar' ? item.ar : item.en.toUpperCase()}
        </text>
      ))}
    </g>
  );
}

function North({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotate})`}>
      <circle r={17} fill="none" stroke={INK} strokeWidth={0.8} opacity={0.5} />
      <path d="M 0 -13 L 4.5 8 L 0 4 L -4.5 8 Z" fill={INK} />
    </g>
  );
}

function ScaleBar({ x, y, metres, unit, locale }: { x: number; y: number; metres: number; unit: number; locale: Locale }) {
  const width = metres * unit;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <line x1={0} y1={0} x2={width} y2={0} stroke={INK} strokeWidth={0.8} />
      {[0, 0.5, 1].map((step) => (
        <line key={step} x1={width * step} y1={-4} x2={width * step} y2={4} stroke={INK} strokeWidth={0.8} />
      ))}
      <rect x={0} y={-2} width={width / 2} height={4} fill={INK} />
      <text x={width / 2} y={20} fontSize={10.5} textAnchor="middle" fill={INK} fontFamily="var(--font-jost)" letterSpacing={1.5}>
        {locale === 'ar' ? `${metres} م` : `${metres} m`}
      </text>
    </g>
  );
}

function Tree({ x, y, r = 14 }: { x: number; y: number; r?: number }) {
  return (
    <g stroke={INK} fill="none" opacity={0.55}>
      <circle cx={x} cy={y} r={r} strokeWidth={0.8} />
      <circle cx={x} cy={y} r={1.6} fill={INK} stroke="none" />
    </g>
  );
}

/* ── 01 · Courtyard House: four wings about a court ───────── */

function Courtyard({ locale }: { locale: Locale }) {
  const u = 14; // pixels per metre
  return (
    <svg viewBox="0 0 760 640" className="w-full bg-paper" role="img" aria-label={locale === 'ar' ? 'مسقط أفقي للدور الأرضي: أربعة أجنحة حول فناء' : 'Ground floor plan: four wings around a courtyard'}>
      {/* Plot boundary and street */}
      <rect x={60} y={50} width={35 * u} height={38 * u} fill="none" stroke={INK} strokeWidth={0.8} strokeDasharray="10 5 2 5" opacity={0.5} />

      {/* Roof overhang to the court, dashed: it is above the cut */}
      <rect x={60 + 9.5 * u} y={50 + 11.5 * u} width={16 * u} height={15 * u} fill="none" stroke={INK} strokeWidth={0.8} strokeDasharray="6 5" opacity={0.5} />

      {/* The four wings, as solid wall thickness */}
      <g fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="miter">
        <path d={`M ${60 + 4 * u} ${50 + 6 * u} h ${27 * u} v ${26 * u} h ${-27 * u} Z`} />
      </g>
      <g fill={PAPER} stroke={INK} strokeWidth={4}>
        <rect x={60 + 12 * u} y={50 + 14 * u} width={11 * u} height={10 * u} />
      </g>
      {/* Openings onto the court: the wall is cut where the glass is */}
      <g stroke={PAPER} strokeWidth={5}>
        <line x1={60 + 13.5 * u} y1={50 + 14 * u} x2={60 + 21.5 * u} y2={50 + 14 * u} />
        <line x1={60 + 13.5 * u} y1={50 + 24 * u} x2={60 + 21.5 * u} y2={50 + 24 * u} />
        <line x1={60 + 12 * u} y1={50 + 15.5 * u} x2={60 + 12 * u} y2={50 + 22.5 * u} />
        <line x1={60 + 23 * u} y1={50 + 15.5 * u} x2={60 + 23 * u} y2={50 + 22.5 * u} />
        {/* Two doors: the family's, and the majlis's own from the street */}
        <line x1={60 + 8 * u} y1={50 + 32 * u} x2={60 + 10 * u} y2={50 + 32 * u} />
        <line x1={60 + 25 * u} y1={50 + 32 * u} x2={60 + 27 * u} y2={50 + 32 * u} />
      </g>
      <g stroke={INK} strokeWidth={1}>
        <line x1={60 + 13.5 * u} y1={50 + 14 * u} x2={60 + 21.5 * u} y2={50 + 14 * u} />
        <line x1={60 + 13.5 * u} y1={50 + 24 * u} x2={60 + 21.5 * u} y2={50 + 24 * u} />
        <line x1={60 + 12 * u} y1={50 + 15.5 * u} x2={60 + 12 * u} y2={50 + 22.5 * u} />
        <line x1={60 + 23 * u} y1={50 + 15.5 * u} x2={60 + 23 * u} y2={50 + 22.5 * u} />
      </g>

      {/* Partitions */}
      <g stroke={INK} strokeWidth={2.5}>
        <line x1={60 + 12 * u} y1={50 + 6 * u} x2={60 + 12 * u} y2={50 + 14 * u} />
        <line x1={60 + 23 * u} y1={50 + 6 * u} x2={60 + 23 * u} y2={50 + 14 * u} />
        <line x1={60 + 4 * u} y1={50 + 19 * u} x2={60 + 12 * u} y2={50 + 19 * u} />
        <line x1={60 + 12 * u} y1={50 + 24 * u} x2={60 + 12 * u} y2={50 + 32 * u} />
        <line x1={60 + 21 * u} y1={50 + 24 * u} x2={60 + 21 * u} y2={50 + 32 * u} />
        <line x1={60 + 23 * u} y1={50 + 19 * u} x2={60 + 31 * u} y2={50 + 19 * u} />
      </g>

      {/* The court: a rill, and one tree off centre */}
      <rect x={60 + 13.2 * u} y={50 + 20.6 * u} width={8.6 * u} height={1 * u} fill={INK} fillOpacity={0.08} stroke={INK} strokeWidth={0.8} />
      <Tree x={60 + 20 * u} y={50 + 17 * u} r={26} />
      <Tree x={60 + 2 * u} y={50 + 4 * u} />
      <Tree x={60 + 33 * u} y={50 + 35 * u} />
      <Tree x={60 + 2 * u} y={50 + 35.5 * u} r={11} />

      <Labels
        locale={locale}
        items={[
          { x: 60 + 17.5 * u, y: 50 + 19.2 * u, ar: 'الفناء', en: 'Court' },
          { x: 60 + 17.5 * u, y: 50 + 10.4 * u, ar: 'المعيشة', en: 'Living' },
          { x: 60 + 8 * u, y: 50 + 12.8 * u, ar: 'المطبخ', en: 'Kitchen' },
          { x: 60 + 8 * u, y: 50 + 25.8 * u, ar: 'الطعام', en: 'Dining' },
          { x: 60 + 27 * u, y: 50 + 12.8 * u, ar: 'النوم', en: 'Bedrooms' },
          { x: 60 + 27 * u, y: 50 + 25.8 * u, ar: 'المجلس', en: 'Majlis' },
          { x: 60 + 16.5 * u, y: 50 + 28.6 * u, ar: 'المدخل', en: 'Entry' },
          { x: 60 + 17.5 * u, y: 50 + 40.4 * u, ar: 'الشارع', en: 'Street' },
        ]}
      />
      <North x={690} y={90} />
      <ScaleBar x={590} y={590} metres={10} unit={u} locale={locale} />
    </svg>
  );
}

/* ── 02 · Atrium Villa: a long section through the void ───── */

function Atrium({ locale }: { locale: Locale }) {
  const u = 16;
  const x0 = 60;
  const ground = 430;
  const floor = (n: number) => ground - n * 3.6 * u;
  return (
    <svg viewBox="0 0 760 560" className="w-full bg-paper" role="img" aria-label={locale === 'ar' ? 'قطاع طولي يمرّ بالبهو المضاء من الأعلى' : 'Long section through the top-lit atrium'}>
      {/* Ground */}
      <line x1={20} y1={ground} x2={740} y2={ground} stroke={INK} strokeWidth={1.2} />
      <g stroke={INK} strokeWidth={0.6} opacity={0.35}>
        {Array.from({ length: 36 }, (_, index) => (
          <line key={index} x1={24 + index * 20} y1={ground + 12} x2={34 + index * 20} y2={ground + 2} />
        ))}
      </g>

      {/* Neighbours, in outline only */}
      <g fill="none" stroke={INK} strokeWidth={0.8} strokeDasharray="6 5" opacity={0.45}>
        <rect x={-10} y={floor(2) - 10} width={52} height={ground - floor(2) + 10} />
        <rect x={x0 + 40 * u + 18} y={floor(2) + 14} width={60} height={ground - floor(2) - 14} />
      </g>

      {/* Slabs and walls, cut solid */}
      <g fill={INK}>
        {[0, 1, 2].map((level) => (
          <g key={level}>
            <rect x={x0} y={floor(level) - 5} width={15 * u} height={6} />
            <rect x={x0 + 25 * u} y={floor(level) - 5} width={15 * u} height={6} />
          </g>
        ))}
        <rect x={x0} y={floor(2)} width={7} height={ground - floor(2)} />
        <rect x={x0 + 40 * u - 7} y={floor(2)} width={7} height={ground - floor(2)} />
        <rect x={x0 + 15 * u - 3} y={floor(2) - 5} width={5} height={14} />
        <rect x={x0 + 25 * u - 2} y={floor(2) - 5} width={5} height={14} />
        {/* Roof annexe */}
        <rect x={x0 + 28 * u} y={floor(3)} width={12 * u} height={5} />
        <rect x={x0 + 28 * u} y={floor(3)} width={5} height={3.6 * u} />
      </g>

      {/* Rooflight over the void */}
      <g stroke={INK} strokeWidth={1.2} fill="none">
        <path d={`M ${x0 + 15 * u} ${floor(2) - 6} L ${x0 + 20 * u} ${floor(2) - 30} L ${x0 + 25 * u} ${floor(2) - 6}`} />
      </g>

      {/* Light, falling */}
      <g stroke={INK} strokeWidth={0.8} strokeDasharray="3 6" opacity={0.55}>
        {[17, 19, 21, 23].map((x) => (
          <line key={x} x1={x0 + (x - 3.5) * u} y1={floor(2) - 70} x2={x0 + x * u} y2={ground - 8} />
        ))}
      </g>

      {/* The stair through the void */}
      <g stroke={INK} strokeWidth={1.4} fill="none">
        <path d={Array.from({ length: 9 }, (_, index) => `${index === 0 ? 'M' : 'L'} ${x0 + (16 + index * 0.9) * u} ${ground - index * 0.4 * u} h ${0.9 * u}`).join(' ')} />
        <path d={Array.from({ length: 9 }, (_, index) => `${index === 0 ? 'M' : 'L'} ${x0 + (24 - index * 0.9) * u} ${floor(1) - 5 - index * 0.4 * u} h ${-0.9 * u}`).join(' ')} />
      </g>

      <Labels
        locale={locale}
        items={[
          { x: x0 + 20 * u, y: floor(2) - 84, ar: 'سقف زجاجي', en: 'Rooflight' },
          { x: x0 + 20 * u, y: floor(1) + 2.2 * u, ar: 'البهو', en: 'Atrium' },
          { x: x0 + 7.5 * u, y: floor(0) - 1.5 * u, ar: 'المعيشة', en: 'Living' },
          { x: x0 + 32.5 * u, y: floor(0) - 1.5 * u, ar: 'المطبخ', en: 'Kitchen' },
          { x: x0 + 7.5 * u, y: floor(1) - 1.5 * u, ar: 'غرفة نوم', en: 'Bedroom' },
          { x: x0 + 32.5 * u, y: floor(1) - 1.5 * u, ar: 'غرفة نوم', en: 'Bedroom' },
          { x: x0 + 34 * u, y: floor(2) - 1.5 * u, ar: 'ملحق', en: 'Annexe' },
        ]}
      />
      <ScaleBar x={590} y={500} metres={10} unit={u} locale={locale} />
    </svg>
  );
}

/* ── 03 · Olive Terraces: three pavilions on the contours ─── */

function Terraces({ locale }: { locale: Locale }) {
  const contour = (offset: number, bend: number) => `M -20 ${140 + offset} C 180 ${100 + offset + bend}, 380 ${210 + offset - bend}, 560 ${150 + offset} S 720 ${120 + offset + bend}, 800 ${160 + offset}`;
  const trees: [number, number, number][] = [
    [90, 120, 15], [215, 95, 12], [330, 250, 16], [470, 120, 13], [610, 210, 15], [690, 330, 12],
    [120, 330, 14], [50, 450, 12], [300, 520, 15], [420, 400, 12], [560, 540, 14], [700, 480, 13], [230, 420, 11],
  ];
  return (
    <svg viewBox="0 0 760 640" className="w-full bg-paper" role="img" aria-label={locale === 'ar' ? 'مخطط الموقع: ثلاثة أجنحة على خطوط الكنتور' : 'Site plan: three pavilions set along the contours'}>
      {/* Contours: the existing terraces are the heavier lines */}
      <g fill="none" stroke={INK}>
        {[0, 60, 120, 180, 240, 300, 360, 420].map((offset, index) => (
          <path key={offset} d={contour(offset, index % 2 ? 26 : -18)} strokeWidth={index === 2 || index === 5 ? 2.2 : 0.7} opacity={index === 2 || index === 5 ? 0.8 : 0.35} />
        ))}
      </g>

      {/* Pavilions */}
      <g fill={PAPER} stroke={INK} strokeWidth={5}>
        <rect x={120} y={200} width={210} height={74} transform="rotate(7 225 237)" />
        <rect x={420} y={228} width={150} height={66} transform="rotate(-9 495 261)" />
        <rect x={250} y={405} width={190} height={70} transform="rotate(4 345 440)" />
      </g>
      {/* Roofs over, dashed */}
      <g fill="none" stroke={INK} strokeWidth={0.8} strokeDasharray="6 5" opacity={0.5}>
        <rect x={104} y={186} width={242} height={102} transform="rotate(7 225 237)" />
        <rect x={406} y={214} width={178} height={94} transform="rotate(-9 495 261)" />
        <rect x={234} y={391} width={222} height={98} transform="rotate(4 345 440)" />
      </g>
      {/* The covered walk between them */}
      <path d="M 330 262 L 420 270 M 470 300 L 400 400" stroke={INK} strokeWidth={1} strokeDasharray="2 5" fill="none" />

      {/* The pool, cut along the contour */}
      <rect x={470} y={392} width={230} height={34} transform="rotate(-6 585 409)" fill={INK} fillOpacity={0.09} stroke={INK} strokeWidth={1.4} />

      {trees.map(([x, y, r]) => (
        <Tree key={`${x}-${y}`} x={x} y={y} r={r} />
      ))}

      <Labels
        locale={locale}
        items={[
          { x: 225, y: 243, ar: 'جناح المعيشة', en: 'Living' },
          { x: 495, y: 266, ar: 'جناح الضيوف', en: 'Guests' },
          { x: 345, y: 446, ar: 'جناح النوم', en: 'Sleeping' },
          { x: 590, y: 462, ar: 'المسبح', en: 'Pool' },
        ]}
      />
      <North x={690} y={80} rotate={-24} />
      <ScaleBar x={560} y={596} metres={20} unit={7} locale={locale} />
    </svg>
  );
}

export function Drawing({ id, locale, className }: { id: DrawingId; locale: Locale; className?: string }) {
  if (id === 'model') return <Plan locale={locale} className={className} />;
  return (
    <div className={className}>
      {id === 'courtyard' && <Courtyard locale={locale} />}
      {id === 'atrium' && <Atrium locale={locale} />}
      {id === 'terraces' && <Terraces locale={locale} />}
    </div>
  );
}

export const drawingTitle: Record<DrawingId, { ar: string; en: string }> = {
  courtyard: { ar: 'مسقط الدور الأرضي · 1:200', en: 'Ground floor plan · 1:200' },
  atrium: { ar: 'قطاع طولي عبر البهو · 1:200', en: 'Long section through the atrium · 1:200' },
  terraces: { ar: 'مخطط الموقع العام · 1:500', en: 'Site plan · 1:500' },
  model: { ar: 'مسقط الدور الأرضي · 1:200 · بالمتر', en: 'Ground floor plan · 1:200 · metres' },
};
