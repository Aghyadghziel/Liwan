/**
 * LIWAN — a fictional architecture studio and residential developer.
 *
 * A liwan is the vaulted hall that opens onto a courtyard in Arabian and Persian building:
 * shade on one side, sun on the other, and a threshold between. Every word here is written
 * as a studio would write it — plainly, about building.
 */

export const studio = {
  name: 'LIWAN',
  line: 'Architecture designed for living.',
  email: 'studio@liwan.com',
  phone: '+966 11 000 0000',
  city: 'Riyadh',
  founded: 2009,
};

export const nav = [
  { label: 'Projects', href: '#projects' },
  { label: 'Residences', href: '#residence' },
  { label: 'Experience', href: '#experience' },
  { label: 'Studio', href: '#studio' },
  { label: 'Materials', href: '#materials' },
  { label: 'Contact', href: '#contact' },
];

export const hero = {
  kicker: 'Liwan · Residential architecture',
  line1: 'Architecture',
  line2: 'designed for living.',
  text: 'Luxury residences designed around the way you live — and built from the materials you choose, in the light they will actually stand in.',
  primary: 'Explore the residence',
  secondary: 'View projects',
  scroll: 'Scroll to enter',
};

export const statement = {
  label: 'The idea',
  lead: 'We do not design houses. We design how a day moves through a house.',
  body: [
    'A plan is a schedule of light. Where the sun lands at seven, where the shade sits at three, which wall you touch on the way in, and which room you never want to leave in the evening.',
    'Everything else — the stone, the joinery, the depth of a reveal — exists to serve that. It is why our drawings start with the sun and the wind, not the elevation.',
  ],
};

export const experience = {
  label: 'Why we build it in 3D first',
  title: 'See it before it exists.',
  text: 'A render is a photograph of one decision. A model is every decision, still open.',
  points: [
    { n: '01', title: 'Walk it, do not imagine it', text: 'Stand in the living room at the height you actually stand. Distances stop being numbers on a drawing.' },
    { n: '02', title: 'Choose in the real light', text: 'Marble in a sample box is not marble at four in the afternoon. Here every finish is seen in the light of the house itself.' },
    { n: '03', title: 'Decide once, build once', text: 'Every change made on screen is a change not made on site, where it costs weeks instead of seconds.' },
  ],
};

export const configure = {
  label: 'Configure',
  title: 'Configure your residence.',
  text: 'A short list of decisions, the ones that actually change how the house feels. Pick a room; the camera goes there and the house updates as you choose.',
  reset: 'Reset to the studio specification',
  summary: 'Your specification',
  cta: 'Send this specification to the studio',
  note: 'Nothing is locked in. The studio takes it from here.',
};

export type Project = {
  slug: string;
  number: string;
  name: string;
  location: string;
  year: string;
  status: string;
  area: string;
  bedrooms: string;
  architecture: string;
  summary: string;
  concept: string;
  materials: string[];
  exterior: string;
  interior: string;
  plan: string;
  /** Tone used for the project's editorial block, so each one has its own light. */
  tone: 'sand' | 'shade' | 'stone' | 'night';
};

export const projects: Project[] = [
  {
    slug: 'dune-house',
    number: '01',
    name: 'Dune House',
    location: 'AlUla, Saudi Arabia',
    year: '2024',
    status: 'Completed',
    area: '820 m²',
    bedrooms: '5 bedrooms',
    architecture: 'Single storey, courtyard plan',
    summary: 'A house pressed low into the sand, organised around a courtyard that holds the only shade for a kilometre.',
    concept:
      'The site gives nothing: no trees, no slope, no neighbour to answer. So the house makes its own ground. Four wings enclose a courtyard, the roof oversails by two and a half metres, and every room borrows its light second-hand, off stone.',
    materials: ['Local sandstone', 'Travertine', 'Oak', 'Bronze'],
    exterior: 'Sandstone laid in courses that match the strata behind the site, so the house weathers toward the cliff rather than away from it.',
    interior: 'Deep reveals, plaster the colour of the ground outside, and a single oak stair that turns once to reach the roof terrace.',
    plan: 'Four wings, one courtyard, one pool oriented to the evening sun.',
    tone: 'sand',
  },
  {
    slug: 'atrium-villa',
    number: '02',
    name: 'Atrium Villa',
    location: 'Muscat, Oman',
    year: '2025',
    status: 'Completed',
    area: '640 m²',
    bedrooms: '4 bedrooms',
    architecture: 'Two storeys around a top-lit atrium',
    summary: 'A narrow plot on a hill, solved by pulling the whole house around a single shaft of light.',
    concept:
      'Twelve metres wide and forty deep, with neighbours on both sides. The only light worth having came from above, so the house was opened down the middle and glazed at the top. Every room now faces inward, onto weather.',
    materials: ['Board-marked concrete', 'White marble', 'Walnut', 'Brushed steel'],
    exterior: 'Concrete cast against sawn boards, so the wall carries the grain of the timber that shaped it.',
    interior: 'A marble stair rises through the atrium; at noon it is the brightest object in the house, and at dusk the darkest.',
    plan: 'Living and kitchen at grade, four bedrooms above, all facing the void.',
    tone: 'shade',
  },
  {
    slug: 'olive-terraces',
    number: '03',
    name: 'Olive Terraces',
    location: 'Taif, Saudi Arabia',
    year: '2026',
    status: 'Under construction',
    area: '1,150 m²',
    bedrooms: '6 bedrooms',
    architecture: 'Three pavilions on a terraced slope',
    summary: 'An old olive terrace kept exactly as found, with three pavilions set into the steps between the trees.',
    concept:
      'The instruction from the client was to lose no tree. The house was therefore broken into three, and the walls follow the dry-stone retaining lines that were already there. What looks like a design decision was a survey.',
    materials: ['Dry-stone', 'Limestone', 'Light oak', 'Patinated bronze'],
    exterior: 'New limestone sits directly on the old dry-stone, one course reading into the next.',
    interior: 'Low ceilings in the sleeping pavilion, a five-metre ceiling in the living one, and a covered walk between them.',
    plan: 'Three pavilions, two terraces, one long pool cut along the contour.',
    tone: 'stone',
  },
  {
    slug: 'horizon-residences',
    number: '04',
    name: 'Horizon Residences',
    location: 'Riyadh, Saudi Arabia',
    year: '2027',
    status: 'In design',
    area: '24 residences',
    bedrooms: '3–5 bedrooms each',
    architecture: 'Residential development, nine floors',
    summary: 'Twenty-four apartments, each with a room that is outside — a loggia deep enough to be lived in through summer.',
    concept:
      'A tower of balconies in this climate is a tower of unused balconies. Here the outdoor room is cut into the plan instead of hung off it, shaded on three sides, and sized for a table of eight.',
    materials: ['Precast stone', 'Travertine', 'Dark oak', 'Bronze mesh'],
    exterior: 'A precast frame with bronze mesh screens that filter the west sun and let the evening through.',
    interior: 'Every residence opens along its full width; no corridor is longer than four metres.',
    plan: 'Nine floors, two to four residences per floor, all corner-lit.',
    tone: 'night',
  },
];

export const materials = [
  { name: 'Travertine', use: 'Floors · terraces · pool coping', note: 'Filled and honed. Warm underfoot, and it takes a chip without looking damaged.', swatch: '#cbbb9f' },
  { name: 'Oak', use: 'Floors · joinery · stairs', note: 'Rift sawn and oiled, never lacquered, so it can be repaired in place.', swatch: '#c9b18d' },
  { name: 'Marble', use: 'Worktops · bathrooms · one stair', note: 'Book matched from a single block, which is the only way the veins agree.', swatch: '#eceae5' },
  { name: 'Limestone', use: 'Facades · garden walls', note: 'Bush hammered for grip in the sun, sawn smooth where hands land.', swatch: '#d2cdc1' },
  { name: 'Concrete', use: 'Structure · roof slabs', note: 'Cast against sawn boards. The formwork is the finish, so it is set out like joinery.', swatch: '#bdb8ae' },
  { name: 'Bronze', use: 'Handles · screens · frames', note: 'Left to patinate. It darkens where it is touched, which is the point.', swatch: '#8a6a44' },
  { name: 'Glass', use: 'South elevations', note: 'Low iron, so the green edge does not tint the view at four metres wide.', swatch: '#cfd8d6' },
  { name: 'Walnut', use: 'Kitchens · doors · tables', note: 'Crown cut, kept for the rooms you sit in rather than pass through.', swatch: '#4a3327' },
];

export const services = [
  { n: '01', name: 'Architecture', text: 'Concept to completion, including the drawings the contractor actually builds from.' },
  { n: '02', name: 'Interior design', text: 'Specified in the same model as the building, so the joinery meets the wall correctly.' },
  { n: '03', name: 'Residential development', text: 'Multi-unit schemes, from feasibility to handover.' },
  { n: '04', name: 'Villa design', text: 'One house, one client, one site, studied properly.' },
  { n: '05', name: 'Landscape', text: 'Planting, water and shade designed with the plan, not after it.' },
  { n: '06', name: '3D visualisation', text: 'The model you are looking at. We build one for every project we take.' },
  { n: '07', name: 'Property customisation', text: 'Buyers choose finishes in the model and sign off what they have seen.' },
  { n: '08', name: 'Turnkey delivery', text: 'Site supervision, procurement and handover with the keys.' },
];

export const studioStory = {
  label: 'Studio',
  title: 'A small studio, deliberately.',
  body: [
    'LIWAN was founded in Riyadh in 2009. We take four projects a year, because the drawings that matter are the ones done slowly, and because the architect you meet should be the one who details your house.',
    'We work between two things: the courtyard house, which this region solved a thousand years ago, and the way people actually live now — open plans, long glass, cars, air conditioning. Most of our work is the argument between the two.',
  ],
  stats: [
    { value: '16', label: 'Years' },
    { value: '41', label: 'Residences completed' },
    { value: '4', label: 'Projects a year' },
    { value: '100%', label: 'Built from our own drawings' },
  ],
};

export const contact = {
  label: 'Start a project',
  title: 'Tell us about the site.',
  text: 'A plot number and a few photographs are enough to begin. We will tell you honestly whether we are the right studio for it.',
  fields: { name: 'Name', email: 'Email', location: 'Where is the site?', brief: 'What are you thinking of building?' },
  send: 'Send enquiry',
  sent: 'Thank you — we have it. You will hear from the studio within two working days.',
  direct: 'Or write to us directly',
};
