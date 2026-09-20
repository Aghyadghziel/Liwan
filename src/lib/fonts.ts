import { Alexandria, IBM_Plex_Sans_Arabic, Instrument_Serif, Jost, Noto_Naskh_Arabic } from 'next/font/google';

/**
 * Two voices in each language. Latin: Jost (geometric, light) with Instrument Serif for the
 * editorial line. Arabic: Alexandria, which shares Jost's geometry, for headings; IBM Plex
 * Sans Arabic for reading; Noto Naskh for the editorial line, as the serif's counterpart.
 */
const jost = Jost({ subsets: ['latin'], variable: '--font-jost', display: 'swap' });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const alexandria = Alexandria({ subsets: ['arabic'], weight: ['200', '300', '400', '500'], variable: '--font-alexandria', display: 'swap' });
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['300', '400', '500'], variable: '--font-plex-ar', display: 'swap' });
const naskh = Noto_Naskh_Arabic({ subsets: ['arabic'], weight: ['400', '500'], variable: '--font-naskh', display: 'swap' });

export const fontVariables = [jost, serif, alexandria, plexArabic, naskh].map((font) => font.variable).join(' ');
