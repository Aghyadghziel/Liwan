import type { T } from '@/lib/i18n';
import generated from './media.generated.json';

/**
 * Photography.
 *
 * LIWAN is a fictional studio, so its three "built" projects are illustrated with reference
 * photographs of real buildings from Unsplash — credited on /credits and in
 * public/photography/CREDITS.md — and the fourth project, which exists only as the model on
 * this site, is illustrated with frames of that model, labelled as such wherever they appear.
 *
 * Files are prepared by tools/photos/prepare.py from tools/photos/selection.json, which writes
 * media.generated.json with each file's size, blur placeholder and credit. This module gives
 * each one its role in the page and its words.
 */

export type Photo = {
  src: string;
  w: number;
  h: number;
  alt: T;
  blur?: string;
  /** CSS object-position, when the subject is off centre. */
  focus?: string;
  /** True when the image is a frame of the 3D model rather than a photograph. */
  render?: boolean;
  credit?: { name: string; url: string };
};

export type Role = 'hero' | 'tall' | 'wide' | 'exterior' | 'interior' | 'detail' | 'closing';
export type ProjectMedia = Partial<Record<Role, Photo>>;

type Generated = Record<string, { src: string; w: number; h: number; blur: string; credit?: { name: string; url: string } }>;
const files = generated as Generated;

const L = (ar: string, en: string): T => ({ ar, en });

function photo(key: string, alt: T, extra: Partial<Photo> = {}): Photo | undefined {
  const file = files[key];
  if (!file) return undefined;
  return { ...file, alt, ...extra };
}

function roles(entries: Partial<Record<Role, Photo | undefined>>): ProjectMedia {
  return Object.fromEntries(Object.entries(entries).filter(([, value]) => value)) as ProjectMedia;
}

/* ── 01 · Courtyard House ─────────────────────────────────── */

const courtyard = roles({
  hero: photo('courtyard-hero', L('مبانٍ بلياسة بلون الرمل حول فناء فيه مسبح ونخيل، في ضوء العصر', 'Sand-render buildings around a courtyard with a pool and palms, in late daylight')),
  tall: photo('courtyard-tall', L('فناء تتوسّطه قناة ماء ضيقة وأشجار صغيرة', 'A courtyard with a narrow water channel and young trees')),
  exterior: photo('courtyard-exterior', L('صفّ من الفتحات المقوّسة في جدار بلياسة رملية حول الفناء', 'A row of arched openings in a sand-render wall around the courtyard')),
  interior: photo('courtyard-interior', L('غرفة نوم بلياسة دافئة ونافذة طولية تطلّ على جبال الصحراء', 'A bedroom in warm plaster with a tall slot window onto desert mountains')),
  detail: photo('courtyard-detail', L('أقواس متتابعة في جدار بلون الطين، وظلّ عميق', 'Receding arches in an earth-coloured wall, and deep shadow')),
  closing: photo('courtyard-closing', L('ضوء الشمس على سطح الماء عند حافة مسبح مدرّجة', 'Sunlight on water at the stepped edge of a pool'), { focus: '50% 45%' }),
  wide: photo('courtyard-wide', L('فتحة مقوّسة في جدار جبسي أملس تتدلّى عليها ستارة كتّانية', 'An arched opening in smooth plaster, with a linen curtain')),
});

/* ── 02 · Atrium Villa ────────────────────────────────────── */

const atrium = roles({
  hero: photo('atrium-hero', L('بيت من الخرسانة الظاهرة بكتل متداخلة بارزة', 'A fair-faced concrete house of stacked, cantilevered volumes')),
  tall: photo('atrium-tall', L('درج بدرجات خشبية بين جدارين من الخرسانة الظاهرة، مضاء من الأعلى', 'A stair with timber treads between board-marked concrete walls, lit from above')),
  exterior: photo('atrium-exterior', L('جناح خرساني بدرج حلزوني منحوت، مفتوح على الخارج', 'A concrete pavilion with a sculptural spiral stair, open to the outside')),
  interior: photo('atrium-interior', L('غرفة معيشة بسقف خرساني وكنب فاتح وزجاج بكامل الارتفاع', 'A living room with a concrete ceiling, a pale sofa and full-height glazing')),
  detail: photo('atrium-detail', L('ركن من جدار خرساني مصبوب على ألواح، في ضوء مائل', 'The corner of a board-marked concrete wall, in raking light')),
  closing: photo('atrium-closing', L('باطن بلاطة خرسانية بارزة أمام سماء بيضاء', 'The underside of a cantilevered concrete slab against a white sky'), { focus: '50% 60%' }),
  wide: photo('atrium-wide', L('مطبخ بسقف خرساني وجزيرة طويلة بسطح حجري وقاعدة خشبية', 'A kitchen with a concrete ceiling and a long island in stone over timber')),
});

/* ── 03 · Olive Terraces ──────────────────────────────────── */

const olive = roles({
  hero: photo('olive-hero', L('مساكن منخفضة متدرّجة على منحدر، بينها مسبح', 'Low houses stepping down a slope, with a pool between them')),
  tall: photo('olive-tall', L('شرفة المسبح بساتر خشبي وأشجار زيتون', 'A pool terrace with a timber screen and olive trees')),
  exterior: photo('olive-exterior', L('مساكن بأسقف مستوية ولياسة فاتحة، مع مسبح وزراعة زيتون', 'Flat-roofed houses in pale render, with a pool and olive planting')),
  interior: photo('olive-interior', L('غرفة طعام بطاولة وكراسي من البلوط وستائر شفّافة', 'A dining room with an oak table and chairs, and sheer curtains')),
  detail: photo('olive-detail', L('ممرّ مقوّس يفضي إلى درجات حجرية في الشمس', 'An archway opening onto sunlit stone steps')),
  closing: photo('olive-closing', L('جذوع زيتون معمّرة أمام جدار مطليّ بالجير، وقناة ماء ضيقة', 'Old olive trunks against a limewashed wall, and a narrow water rill'), { focus: '50% 55%' }),
  wide: photo('olive-wide', L('فناء بجدران مليّسة ومسبح وأرضية حجرية فاتحة', 'A plaster-walled courtyard with a pool and a pale stone deck')),
});

/* ── 04 · Hittin Residence — the model, not a photograph ──── */

const model = (key: string, alt: T, extra: Partial<Photo> = {}) => photo(key, alt, { render: true, ...extra });

const hittin = roles({
  hero: model('hittin-hero', L('المسكن من فوق الحديقة: الشرفة والمسبح والكتلة العلوية', 'The residence from above the garden: terrace, pool and upper volume')),
  tall: model('hittin-tall', L('الواجهة الجنوبية الزجاجية تحت بروز السقف', 'The glazed south face, under the oversailing roof')),
  exterior: model('hittin-exterior', L('المدخل الغربي من تحت الرواق المظلّل', 'The western entrance, from under the shaded portico')),
  interior: model('hittin-interior', L('فراغ المعيشة بأرضية البلوط والجدران الجيرية', 'The living space, with its oak floor and lime-white walls')),
  detail: model('hittin-detail', L('جزيرة المطبخ بسطح رخامي وخزائن من البلوط', 'The kitchen island in marble over oak cabinetry')),
  closing: model('hittin-closing', L('المسبح والشرفة في ضوء العصر', 'The pool and terrace in late afternoon light')),
  wide: model('hittin-wide', L('المسكن كاملًا من الجنوب الغربي', 'The whole residence, from the south-west')),
});

export const projectMedia: Record<string, ProjectMedia> = {
  'courtyard-house': courtyard,
  'atrium-villa': atrium,
  'olive-terraces': olive,
  'hittin-residence': hittin,
};

/* ── Materials ────────────────────────────────────────────── */

export const materialMedia: Record<string, Photo | undefined> = {
  travertine: photo('material-travertine', L('لوح ترافرتين مقطوع مع العرق', 'A vein-cut travertine slab')),
  oak: photo('material-oak', L('عروق خشب البلوط الفاتح', 'The grain of light oak')),
  marble: photo('material-marble', L('رخام أبيض بعروق رمادية', 'White marble with grey veining')),
  limestone: photo('material-limestone', L('جدار من الحجر الجيري المنشور بمداميك منتظمة', 'A sawn limestone wall in regular courses')),
  concrete: photo('material-concrete', L('خرسانة ظاهرة تحمل آثار ألواح القالب', 'Exposed concrete carrying the marks of its formwork')),
  bronze: photo('material-bronze', L('لوح برونزي معتّق بمسامير، في ضوء دافئ', 'A patinated bronze plate with rivets, in warm light')),
  glass: photo('material-glass', L('انعكاس الغروب على واجهة زجاجية', 'A sunset reflected in a glazed facade')),
  walnut: photo('material-walnut', L('ألواح من قشرة الجوز', 'Boards of walnut veneer')),
};

/* ── Studio ───────────────────────────────────────────────── */

export const studioMedia: { desk?: Photo; model?: Photo } = {
  desk: photo('studio-desk', L('لوحة عيّنات المواد: فلّين وخشب وتيرازو ومعدن بألوان دافئة', 'A board of material samples: cork, timber, terrazzo and metal in warm tones')),
  model: photo('studio-model', L('مجسّم كرتوني أبيض لمبنى بثلاث فتحات، بظلّ حادّ', 'A white card model of a building with three openings, in hard shadow')),
};

/** Everything that carries a credit, for the /credits page. */
export const allPhotos = () =>
  [...Object.values(projectMedia).flatMap((set) => Object.values(set)), ...Object.values(materialMedia), ...Object.values(studioMedia)].filter(
    (item): item is Photo => Boolean(item?.credit),
  );
