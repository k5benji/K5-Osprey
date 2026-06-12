import type { OutpostVideo } from '../types/outpost';

/**
 * Curated archive of transmissions.
 *
 * Curation rules:
 *  - engineering, aerospace, naval, industrial, historical, theology,
 *    nature, sea life, fishing, craftsmanship, systems thinking
 *  - NO graphic combat footage, gore, propaganda, extremist content,
 *    or weapon tutorials
 *
 * To add a video: append an entry with a unique id. Nothing else needed.
 */
export const videos: OutpostVideo[] = [
  {
    id: 'OP-001',
    title: 'Saturn V Launch — Apollo 11',
    source: 'NASA',
    description:
      'Restored footage of the Saturn V carrying Apollo 11 off Pad 39A. The most powerful machine ever flown, frame by frame.',
    embedUrl: 'https://www.youtube.com/embed/S9HdPi9Ikhk',
  },
  {
    id: 'OP-002',
    title: 'How a Mechanical Watch Works',
    source: 'Hamilton / Archive Film',
    description:
      'A 1949 educational film explaining the escapement, mainspring, and gear train of a mechanical watch. Craftsmanship as systems thinking.',
    embedUrl: 'https://www.youtube.com/embed/508-rmdY4jQ',
  },
  {
    id: 'OP-003',
    title: 'Aircraft Carrier Flight Deck Operations',
    source: 'US Navy',
    description:
      'Catapult launches and arrested recoveries aboard a Nimitz-class carrier. Choreography of one of the most dangerous workplaces on earth.',
    embedUrl: 'https://www.youtube.com/embed/CBDr9_g1ZW0',
  },
  {
    id: 'OP-004',
    title: 'Falcon Heavy Test Flight',
    source: 'SpaceX',
    description:
      'The first flight of Falcon Heavy, including the synchronized side-booster landing at Cape Canaveral.',
    embedUrl: 'https://www.youtube.com/embed/wbSwFU6tY1c',
  },
  {
    id: 'OP-005',
    title: 'North Sea Trawler in Heavy Weather',
    source: 'Maritime Archive',
    description:
      'A fishing trawler working swells in the North Sea. Men, nets, and steel against open water.',
    embedUrl: 'https://www.youtube.com/embed/fBNz5xF-Kx4',
  },
  {
    id: 'OP-006',
    title: 'Forging a Damascus Steel Blade',
    source: 'Craft Archive',
    description:
      'Pattern-welded steel folded and forged by hand. Fire, hammer, and patience.',
    embedUrl: 'https://www.youtube.com/embed/eYItzs0FCYU',
  },
  {
    id: 'OP-007',
    title: 'Blue Angels Cockpit Footage',
    source: 'US Navy Blue Angels',
    description:
      'Inside the diamond formation. Centimeter precision at 400 knots.',
    embedUrl: 'https://www.youtube.com/embed/Y4j2nfZ-YJY',
  },
  {
    id: 'OP-008',
    title: 'Deep Sea Creatures of the Midnight Zone',
    source: 'MBARI',
    description:
      'Footage from remotely operated vehicles thousands of meters below the surface. Life engineered by pressure and darkness.',
    embedUrl: 'https://www.youtube.com/embed/UTr9XdfDc5c',
  },
  {
    id: 'OP-009',
    title: 'Container Ship Bridge — Pacific Crossing',
    source: 'Maritime Archive',
    description:
      'Time on the bridge of a container vessel mid-Pacific. Global industry at its quietest and largest.',
    embedUrl: 'https://www.youtube.com/embed/AeFcs_qXJqg',
  },
  {
    id: 'OP-010',
    title: 'Gregorian Chant — Benedictine Monks',
    source: 'Abbey Archive',
    description:
      'Plainchant sung in a monastery. A thousand-year-old transmission still on the air.',
    embedUrl: 'https://www.youtube.com/embed/PqzGl0Rfo9M',
  },
];
