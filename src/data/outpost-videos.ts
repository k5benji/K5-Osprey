import type { OutpostVideo } from '../types/outpost';

/**
 * Curated archive of transmissions.
 * To add a video: append an entry with a unique id. Nothing else needed.
 */
export const videos: OutpostVideo[] = [
  {
    id: 'OP-005',
    title: 'North Sea Trawler in Heavy Weather',
    source: 'Maritime Archive',
    category: 'fishing',
    description:
      'A fishing trawler working swells in the North Sea. Men, nets, and steel against open water.',
    embedUrl: 'https://www.youtube.com/embed/fBNz5xF-Kx4',
  },
  {
    id: 'OP-077',
    title: 'Deep Dive: Exploring the Gulf',
    source: 'NOAA Ocean Exploration',
    category: 'deep sea / exploration',
    embedUrl: 'https://www.youtube-nocookie.com/embed/sK8uBH17csw',
  },
  {
    id: 'OP-089',
    title: 'Blue Angels F/A-18 Cockpit Video',
    source: 'YouTube',
    category: 'cockpit / raw aviation',
    contentWarning: 'Graphic warning',
    embedUrl: 'https://www.youtube-nocookie.com/embed/2GhhyUtXbjA',
  },
  {
    id: 'OP-106',
    title: 'Caught in Rough Seas - Fishing Vessel Battles the Storm',
    source: 'YouTube',
    category: 'commercial fishing / rough sea',
    contentWarning: 'Graphic warning',
    embedUrl: 'https://www.youtube-nocookie.com/embed/wdzc8-7xy08',
  },
  {
    id: 'OP-146',
    title: 'Heart of the Beast — Official Trailer (2026)',
    source: 'Paramount Pictures',
    category: 'film trailer',
    embedUrl: 'https://www.youtube-nocookie.com/embed/JFQcDFhNh4o',
  },
  {
    id: 'OP-147',
    title: 'Logan — Official Trailer',
    source: '20th Century Studios',
    category: 'film trailer',
    embedUrl: 'https://www.youtube-nocookie.com/embed/Div0iP65aZo',
  },
  {
    id: 'OP-148',
    title: 'Transformers: War for Cybertron — Full Trailer',
    source: 'TransformersGame',
    category: 'game trailer',
    embedUrl: 'https://www.youtube-nocookie.com/embed/QFZrL0x63c8',
  },
];
