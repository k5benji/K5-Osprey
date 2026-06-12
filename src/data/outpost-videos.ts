import type { OutpostVideo } from '../types/outpost';

/**
 * Curated archive of transmissions.
 *
 * Curation rules:
 *  - engineering, aerospace, naval, industrial, historical, theology,
 *    nature, sea life, fishing, craftsmanship, systems thinking
 *  - NO gore, propaganda, extremist content, or weapon tutorials
 *  - entries with military/combat content carry a contentWarning
 *
 * To add a video: append an entry with a unique id. Nothing else needed.
 */
export const videos: OutpostVideo[] = [
  {
    id: 'OP-001',
    title: 'Saturn V Launch — Apollo 11',
    source: 'NASA',
    category: 'aerospace',
    description:
      'Restored footage of the Saturn V carrying Apollo 11 off Pad 39A. The most powerful machine ever flown, frame by frame.',
    embedUrl: 'https://www.youtube.com/embed/S9HdPi9Ikhk',
  },
  {
    id: 'OP-002',
    title: 'How a Mechanical Watch Works',
    source: 'Hamilton / Archive Film',
    category: 'craftsmanship',
    description:
      'A 1949 educational film explaining the escapement, mainspring, and gear train of a mechanical watch. Craftsmanship as systems thinking.',
    embedUrl: 'https://www.youtube.com/embed/508-rmdY4jQ',
  },
  {
    id: 'OP-003',
    title: 'Aircraft Carrier Flight Deck Operations',
    source: 'US Navy',
    category: 'naval operations',
    description:
      'Catapult launches and arrested recoveries aboard a Nimitz-class carrier. Choreography of one of the most dangerous workplaces on earth.',
    embedUrl: 'https://www.youtube.com/embed/CBDr9_g1ZW0',
  },
  {
    id: 'OP-004',
    title: 'Falcon Heavy Test Flight',
    source: 'SpaceX',
    category: 'aerospace',
    description:
      'The first flight of Falcon Heavy, including the synchronized side-booster landing at Cape Canaveral.',
    embedUrl: 'https://www.youtube.com/embed/wbSwFU6tY1c',
  },
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
    id: 'OP-006',
    title: 'Forging a Damascus Steel Blade',
    source: 'Craft Archive',
    category: 'craftsmanship',
    description:
      'Pattern-welded steel folded and forged by hand. Fire, hammer, and patience.',
    embedUrl: 'https://www.youtube.com/embed/eYItzs0FCYU',
  },
  {
    id: 'OP-007',
    title: 'Blue Angels Cockpit Footage',
    source: 'US Navy Blue Angels',
    category: 'aviation',
    description:
      'Inside the diamond formation. Centimeter precision at 400 knots.',
    embedUrl: 'https://www.youtube.com/embed/Y4j2nfZ-YJY',
  },
  {
    id: 'OP-008',
    title: 'Deep Sea Creatures of the Midnight Zone',
    source: 'MBARI',
    category: 'deep sea',
    description:
      'Footage from remotely operated vehicles thousands of meters below the surface. Life engineered by pressure and darkness.',
    embedUrl: 'https://www.youtube.com/embed/UTr9XdfDc5c',
  },
  {
    id: 'OP-009',
    title: 'Container Ship Bridge — Pacific Crossing',
    source: 'Maritime Archive',
    category: 'industry',
    description:
      'Time on the bridge of a container vessel mid-Pacific. Global industry at its quietest and largest.',
    embedUrl: 'https://www.youtube.com/embed/AeFcs_qXJqg',
  },
  {
    id: 'OP-010',
    title: 'Gregorian Chant — Benedictine Monks',
    source: 'Abbey Archive',
    category: 'spiritual',
    description:
      'Plainchant sung in a monastery. A thousand-year-old transmission still on the air.',
    embedUrl: 'https://www.youtube.com/embed/PqzGl0Rfo9M',
  },

  // --- NASA ---
  {
    id: 'OP-011',
    title: 'NASA Now: Wind Tunnel Testing',
    source: 'NASA',
    category: 'aerospace',
    embedUrl: 'https://www.youtube-nocookie.com/embed/P6sCjXISmEU',
  },
  {
    id: 'OP-012',
    title: '3D-Printed Rotating Detonation Rocket Engine Test',
    source: 'NASA',
    category: 'rocket engineering',
    embedUrl: 'https://www.youtube-nocookie.com/embed/UShD03eG9IU',
  },
  {
    id: 'OP-013',
    title: 'NASA Armstrong: Our Skies Are Busy',
    source: 'NASA',
    category: 'flight research',
    embedUrl: 'https://www.youtube-nocookie.com/embed/rUoP77pOQgU',
  },
  {
    id: 'OP-014',
    title: 'Cosmic Dawn: James Webb Documentary',
    source: 'NASA',
    category: 'space engineering',
    embedUrl: 'https://www.youtube-nocookie.com/embed/uSMGENDH_QI',
  },
  {
    id: 'OP-015',
    title: 'Surprisingly STEM: Wind Tunnel Engineers',
    source: 'NASA',
    category: 'engineering',
    embedUrl: 'https://www.youtube-nocookie.com/embed/j9KzzQPY3C4',
  },
  {
    id: 'OP-016',
    title: 'Demonstration Motor-1 Static Test',
    source: 'NASA',
    category: 'rocket test',
    embedUrl: 'https://www.youtube-nocookie.com/embed/T3TfNZsCxDU',
  },
  {
    id: 'OP-017',
    title: 'NASA Tests Model Wing for Fuel Savings',
    source: 'NASA',
    category: 'aircraft engineering',
    embedUrl: 'https://www.youtube-nocookie.com/embed/rROmLTibG5w',
  },
  {
    id: 'OP-018',
    title: 'Tunnel Through Time: NASA Altitude Wind Tunnel',
    source: 'NASA',
    category: 'wind tunnel',
    embedUrl: 'https://www.youtube-nocookie.com/embed/pdpK1knVQYk',
  },
  {
    id: 'OP-019',
    title: 'SLS RS-25 Engine Test',
    source: 'NASA',
    category: 'rocket engine',
    embedUrl: 'https://www.youtube-nocookie.com/embed/rxqMw7BazoI',
  },
  {
    id: 'OP-020',
    title: 'NASA Armstrong Experimental Aircraft',
    source: 'NASA',
    category: 'experimental aircraft',
    embedUrl: 'https://www.youtube-nocookie.com/embed/KwsT3ecSwOw',
  },
  {
    id: 'OP-021',
    title: 'Building 1212: 14x22 Wind Tunnel',
    source: 'NASA',
    category: 'wind tunnel',
    embedUrl: 'https://www.youtube-nocookie.com/embed/wfkUNarQtP8',
  },
  {
    id: 'OP-022',
    title: 'Rocket Engine Testing the NASA Way',
    source: 'NASA',
    category: 'rocket engineering',
    embedUrl: 'https://www.youtube-nocookie.com/embed/RiPzzA281E0',
  },
  {
    id: 'OP-023',
    title: 'NASA Icing Wind Tunnel',
    source: 'NASA',
    category: 'aerospace testing',
    embedUrl: 'https://www.youtube-nocookie.com/embed/aO5VX72kBMc',
  },

  // --- US National Archives ---
  {
    id: 'OP-024',
    title: 'Anti-Aircraft Materiel, 1918–1930',
    source: 'US National Archives',
    category: 'historical military engineering',
    embedUrl: 'https://www.youtube-nocookie.com/embed/YvcIy9kDV6g',
  },
  {
    id: 'OP-025',
    title: 'Army-Navy Screen Magazine No. 21',
    source: 'US National Archives',
    category: 'historical military',
    embedUrl: 'https://www.youtube-nocookie.com/embed/2goQNi2hdRE',
  },
  {
    id: 'OP-026',
    title: 'Flying Platform Tested, 1955',
    source: 'US National Archives',
    category: 'experimental aircraft',
    embedUrl: 'https://www.youtube-nocookie.com/embed/7Ow3EUgIZqQ',
  },
  {
    id: 'OP-027',
    title: 'Army-Navy Screen Magazine No. 16',
    source: 'US National Archives',
    category: 'historical military',
    embedUrl: 'https://www.youtube-nocookie.com/embed/PwIT7T9T1iQ',
  },
  {
    id: 'OP-028',
    title: 'Aviation Training in the United States, 1917–1918',
    source: 'US National Archives',
    category: 'aviation history',
    embedUrl: 'https://www.youtube-nocookie.com/embed/Z2rT4EAzJVk',
  },
  {
    id: 'OP-029',
    title: 'Army-Navy Screen Magazine Number 1',
    source: 'US National Archives',
    category: 'historical military',
    embedUrl: 'https://www.youtube-nocookie.com/embed/EX7n4wMqXwk',
  },
  {
    id: 'OP-030',
    title: 'Moving Images Relating to Experimental Aircraft',
    source: 'US National Archives',
    category: 'experimental aircraft',
    embedUrl: 'https://www.youtube-nocookie.com/embed/SYe3B5muW7c',
  },
  {
    id: 'OP-031',
    title: 'The Big Picture: Pictorial Report No. 28',
    source: 'US National Archives',
    category: 'military archive',
    embedUrl: 'https://www.youtube-nocookie.com/embed/gBNEZ7tZvXM',
  },
  {
    id: 'OP-032',
    title: 'Army-Navy Screen Magazine No. 69',
    source: 'US National Archives',
    category: 'historical military',
    embedUrl: 'https://www.youtube-nocookie.com/embed/OPXB8Z2iWK8',
  },
  {
    id: 'OP-033',
    title: 'U.S. Rushes New Bases in Pacific',
    source: 'US National Archives',
    category: 'naval history',
    embedUrl: 'https://www.youtube-nocookie.com/embed/N6PljcpfL38',
  },
  {
    id: 'OP-034',
    title: 'Disc Flight Development: Avrocar Progress Report',
    source: 'US National Archives',
    category: 'experimental aircraft',
    embedUrl: 'https://www.youtube-nocookie.com/embed/kdSo31A9j_I',
  },
  {
    id: 'OP-035',
    title: 'Around the World by Airplane',
    source: 'US National Archives',
    category: 'aviation history',
    embedUrl: 'https://www.youtube-nocookie.com/embed/poDpyzzRozo',
  },

  // --- U.S. Navy ---
  {
    id: 'OP-036',
    title: 'Ships Sail in Formation During Valiant Shield',
    source: 'DVIDS / U.S. Navy',
    category: 'naval operations',
    contentWarning: 'Military operations / weapons systems may appear',
    embedUrl: 'https://www.youtube-nocookie.com/embed/JVrYuXGVA8Q',
  },
  {
    id: 'OP-037',
    title: 'Welcome to USS Makin Island',
    source: 'U.S. Navy',
    category: 'naval vessel / amphibious assault ship',
    contentWarning: 'Military vessel / weapons systems may appear',
    embedUrl: 'https://www.youtube-nocookie.com/embed/43uIy71dMFE',
  },
  {
    id: 'OP-038',
    title: 'Warbirds Arrive in Pearl Harbor',
    source: 'U.S. Navy',
    category: 'aviation / naval history',
    embedUrl: 'https://www.youtube-nocookie.com/embed/cZtw6rm6eVs',
  },
  {
    id: 'OP-039',
    title: 'USS Harry S. Truman IM-4 Division',
    source: 'U.S. Navy',
    category: 'naval engineering',
    embedUrl: 'https://www.youtube-nocookie.com/embed/vnvobb63jqA',
  },
  {
    id: 'OP-040',
    title: 'USS Asheville',
    source: 'U.S. Navy',
    category: 'submarine / naval operations',
    contentWarning: 'Military vessel / weapons systems may appear',
    embedUrl: 'https://www.youtube-nocookie.com/embed/XMLrSbfM0-E',
  },
  {
    id: 'OP-041',
    title: 'USS Iwo Jima Transit Timelapse',
    source: 'U.S. Navy',
    category: 'naval transit',
    contentWarning: 'Military vessel / operations',
    embedUrl: 'https://www.youtube-nocookie.com/embed/tJDte54ZDlg',
  },
  {
    id: 'OP-042',
    title: 'USS Bataan Transiting the Suez Canal',
    source: 'U.S. Navy',
    category: 'naval transit',
    contentWarning: 'Military vessel / operations',
    embedUrl: 'https://www.youtube-nocookie.com/embed/NFUv8JvxeEo',
  },
  {
    id: 'OP-043',
    title: 'Virtual Tour of USS Santa Barbara',
    source: 'U.S. Navy',
    category: 'naval vessel',
    embedUrl: 'https://www.youtube-nocookie.com/embed/v2S0vLVoLoM',
  },

  // --- NOAA ---
  {
    id: 'OP-044',
    title: 'Strange Creatures at the Bottom of the Sea',
    source: 'NOAA',
    category: 'deep sea',
    embedUrl: 'https://www.youtube-nocookie.com/embed/ST_nC126W_k',
  },
  {
    id: 'OP-045',
    title: 'Gulf of Mexico: Deep-Sea Marine Life',
    source: 'NOAA Ocean Exploration',
    category: 'marine life',
    embedUrl: 'https://www.youtube-nocookie.com/embed/TtDnfTERiCw',
  },
  {
    id: 'OP-046',
    title: 'NOAA Fisheries: 150 Years of Service',
    source: 'NOAA Fisheries',
    category: 'fisheries',
    embedUrl: 'https://www.youtube-nocookie.com/embed/U1pGe_gVwh8',
  },
  {
    id: 'OP-047',
    title: 'Marine Survey Reveals Ocean Insights',
    source: 'NOAA Fisheries',
    category: 'ocean science',
    embedUrl: 'https://www.youtube-nocookie.com/embed/3MR8kaYtwBk',
  },
  {
    id: 'OP-048',
    title: 'Coral Reef Fish Surveys',
    source: 'NOAA',
    category: 'fish / reef science',
    embedUrl: 'https://www.youtube-nocookie.com/embed/Oo7q9l2WpIk',
  },
  {
    id: 'OP-049',
    title: 'Dive In and Explore Coral Reef Ecosystems',
    source: 'NOAA',
    category: 'coral reef',
    embedUrl: 'https://www.youtube-nocookie.com/embed/BPNBLtXXXAk',
  },
  {
    id: 'OP-050',
    title: 'All You Can Eat: Lionfish',
    source: 'NOAA Ocean Today',
    category: 'sea life',
    embedUrl: 'https://www.youtube-nocookie.com/embed/DRkAkeTK_AM',
  },

  // --- Open Yale Courses: Hebrew Bible ---
  {
    id: 'OP-051',
    title: 'The Parts of the Whole',
    source: 'Open Yale Courses',
    category: 'Hebrew Bible / theology',
    embedUrl: 'https://www.youtube-nocookie.com/embed/mo-YL-lv3RY',
  },
  {
    id: 'OP-052',
    title: 'The Hebrew Bible in Its Ancient Near Eastern Setting',
    source: 'Open Yale Courses',
    category: 'Hebrew Bible / history',
    embedUrl: 'https://www.youtube-nocookie.com/embed/wRPqtGywkCw',
  },
  {
    id: 'OP-053',
    title: 'Ancient Near Eastern Setting Continued',
    source: 'Open Yale Courses',
    category: 'Hebrew Bible / history',
    embedUrl: 'https://www.youtube-nocookie.com/embed/ANUD8IK12ms',
  },
  {
    id: 'OP-054',
    title: 'Biblical Narrative: The Stories of the Patriarchs',
    source: 'Open Yale Courses',
    category: 'Hebrew Bible / theology',
    embedUrl: 'https://www.youtube-nocookie.com/embed/O89-OaWMkP0',
  },
  {
    id: 'OP-055',
    title: 'Critical Approaches to the Bible',
    source: 'Open Yale Courses',
    category: 'Bible scholarship',
    embedUrl: 'https://www.youtube-nocookie.com/embed/KBSOn0MSrk8',
  },
  {
    id: 'OP-056',
    title: 'Exodus: From Egypt to Sinai',
    source: 'Open Yale Courses',
    category: 'Hebrew Bible / wilderness',
    embedUrl: 'https://www.youtube-nocookie.com/embed/kS17dLuTPd0',
  },
  {
    id: 'OP-057',
    title: 'Priestly Legacy: Cult, Sacrifice, Purity, Holiness',
    source: 'Open Yale Courses',
    category: 'religion / ritual',
    embedUrl: 'https://www.youtube-nocookie.com/embed/URMs-17otFE',
  },
  {
    id: 'OP-058',
    title: 'The Deuteronomistic History',
    source: 'Open Yale Courses',
    category: 'Hebrew Bible / history',
    embedUrl: 'https://www.youtube-nocookie.com/embed/v07NFEstPjc',
  },
  {
    id: 'OP-059',
    title: 'Literary Prophecy: Amos',
    source: 'Open Yale Courses',
    category: 'prophets / theology',
    embedUrl: 'https://www.youtube-nocookie.com/embed/YJd0Swp7d9Y',
  },
  {
    id: 'OP-060',
    title: 'Responses to Suffering and Evil: Lamentations',
    source: 'Open Yale Courses',
    category: 'spiritual / theology',
    embedUrl: 'https://www.youtube-nocookie.com/embed/RxENRH-v0Xk',
  },

  // --- Military combat documentation (official releases) ---
  {
    id: 'OP-061',
    title: 'Marines Repel Taliban Attack on New Patrol Base',
    source: 'DVIDS / U.S. Marine Corps Combat Camera',
    category: 'combat footage',
    contentWarning: 'Combat footage / violence / weapons',
    embedUrl: 'https://www.youtube-nocookie.com/embed/EC9FOZkzQRo',
  },
  {
    id: 'OP-062',
    title: 'Combat Logistics Battalion 2 Builds Patrol Base Demazong',
    source: 'DVIDS / U.S. Marine Corps',
    category: 'military engineering / Afghanistan',
    contentWarning: 'Military operations / weapons may appear',
    embedUrl: 'https://www.youtube-nocookie.com/embed/792VFZuPvfk',
  },
  {
    id: 'OP-063',
    title: 'RAW Combat Footage — Ramadi, Iraq, 2006',
    source: 'U.S. Navy Combat Camera / archive upload',
    category: 'combat footage / historical Iraq War',
    contentWarning: 'Combat footage / violence / weapons',
    embedUrl: 'https://www.youtube-nocookie.com/embed/HVBaDvqxn0A',
  },
];
