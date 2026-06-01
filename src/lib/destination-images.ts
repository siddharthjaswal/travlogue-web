// Curated Unsplash photo IDs for popular travel destinations
// These are stable CDN URLs that don't require an API key

const CITY_IMAGES: Record<string, string> = {
  // Europe
  paris:        'photo-1502602898657-3e91760cbb34',
  rome:         'photo-1552832230-c0197dd311b5',
  venice:       'photo-1534351590666-13e3e96b5017',
  florence:     'photo-1516738901171-8eb4fc13bd20',
  milan:        'photo-1558618666-fcd25c85cd64',
  naples:       'photo-1603915196773-fba82180cfc3',
  barcelona:    'photo-1583422409516-2895a77efded',
  madrid:       'photo-1539037116277-4db20889f2d4',
  london:       'photo-1513635269975-59663e0ac1ad',
  amsterdam:    'photo-1534351590666-13e3e96b5017',
  berlin:       'photo-1560969184-10fe8719e047',
  munich:       'photo-1595867818082-083862f3d630',
  vienna:       'photo-1516550135131-fe3dcee0b1e1',
  prague:       'photo-1519677100203-a0e668c92439',
  budapest:     'photo-1541849546-216549ae216d',
  lisbon:       'photo-1588676585474-bfe83e779e2f',
  porto:        'photo-1555881400-74d7acaacd8b',
  athens:       'photo-1555993539-1732b0258235',
  santorini:    'photo-1570077188670-e3a8d69ac5ff',
  mykonos:      'photo-1601581875039-e899893d520c',
  dubrovnik:    'photo-1555990793-da11153b2473',
  stockholm:    'photo-1509356843151-3e7d96241e11',
  oslo:         'photo-1513519245088-0e12902e5a38',
  copenhagen:   'photo-1513622470522-26c3c8a854bc',
  zurich:       'photo-1515869460660-de4ee36f7a36',
  geneva:       'photo-1592659762303-90081d34b277',
  edinburgh:    'photo-1558618047-f4b8f4575d1e',
  dublin:       'photo-1549918864-48ac978761a4',
  // Asia
  tokyo:        'photo-1540959733332-eab4deabeeaf',
  osaka:        'photo-1590559899731-a382839e5549',
  kyoto:        'photo-1545569341-9eb8b30979d9',
  bangkok:      'photo-1508009603885-50cf7c579365',
  bali:         'photo-1537996194471-e657df975ab4',
  singapore:    'photo-1525625293386-3f8f99389edd',
  dubai:        'photo-1512453979798-5ea266f8880c',
  istanbul:     'photo-1524231757912-21f4fe3a7200',
  seoul:        'photo-1517154421773-0529f29ea451',
  beijing:      'photo-1599571234909-29ed5d1321d6',
  shanghai:     'photo-1545459720-aac8509eb02c',
  hongkong:     'photo-1507003211169-0a1dd7228f2d',
  mumbai:       'photo-1529253355930-ddbe423a2ac7',
  delhi:        'photo-1587474260584-136574528ed5',
  // Americas
  newyork:      'photo-1485871981521-5b1fd3805eee',
  'new york':   'photo-1485871981521-5b1fd3805eee',
  losangeles:   'photo-1534430480872-3498386e7856',
  miami:        'photo-1507525428034-b723cf961d3e',
  chicago:      'photo-1477959858617-67f85cf4f1df',
  sanfrancisco: 'photo-1501594907352-04cda38ebc29',
  lasvegas:     'photo-1605833556294-ea5c7a74f57d',
  cancun:       'photo-1510097467424-192d713fd8b2',
  mexicocity:   'photo-1518105779142-d975f22f1b0a',
  buenosaires:  'photo-1589909202802-8f4aadce1849',
  rio:          'photo-1483729558449-99ef09a8c325',
  // Africa & Middle East
  capetown:     'photo-1580060839134-75a5edca2e99',
  marrakech:    'photo-1534430480872-3498386e7856',
  cairo:        'photo-1539650116574-75c0c6d18c44',
  // Oceania
  sydney:       'photo-1506973035872-a4ec16b8e8d9',
  melbourne:    'photo-1514395462725-fb4566210144',
  auckland:     'photo-1507699622108-4be3abd695ad',
  // Destinations
  maldives:     'photo-1506905925346-21bda4d32df4',
  hawaii:       'photo-1505852679233-d9fd70aff56d',
  bora:         'photo-1589197331516-4d84b72ebde3',
  patagonia:    'photo-1501854140801-50d01698950b',
  iceland:      'photo-1531366936337-7c912a4589a7',
  alaska:       'photo-1531928351158-2f736078e0a1',
};

const COUNTRY_IMAGES: Record<string, string> = {
  france:      'photo-1502602898657-3e91760cbb34',
  italy:       'photo-1516483638261-f4dbaf036963',
  spain:       'photo-1543785734-4b6e564642f8',
  japan:       'photo-1528360983277-13d401cdc186',
  greece:      'photo-1570077188670-e3a8d69ac5ff',
  thailand:    'photo-1508009603885-50cf7c579365',
  indonesia:   'photo-1537996194471-e657df975ab4',
  uk:          'photo-1513635269975-59663e0ac1ad',
  germany:     'photo-1560969184-10fe8719e047',
  usa:         'photo-1485871981521-5b1fd3805eee',
  australia:   'photo-1506973035872-a4ec16b8e8d9',
  uae:         'photo-1512453979798-5ea266f8880c',
  turkey:      'photo-1524231757912-21f4fe3a7200',
  india:       'photo-1587474260584-136574528ed5',
  china:       'photo-1545459720-aac8509eb02c',
  brazil:      'photo-1483729558449-99ef09a8c325',
  portugal:    'photo-1588676585474-bfe83e779e2f',
  austria:     'photo-1516550135131-fe3dcee0b1e1',
  netherlands: 'photo-1534351590666-13e3e96b5017',
  switzerland: 'photo-1515869460660-de4ee36f7a36',
};

const FALLBACK_TRAVEL_IMAGES = [
  'photo-1488085061387-422e29b40080',
  'photo-1469854523086-cc02fe5d8800',
  'photo-1476514525535-07fb3b4ae5f1',
  'photo-1530521954074-e64f6810b32d',
  'photo-1504150558240-0b4fd8946624',
];

function normalise(s?: string | null): string {
  return (s || '').toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
}

export function getDestinationImageUrl(
  city?: string | null,
  country?: string | null,
  index = 0
): string {
  const cityKey = normalise(city);
  const countryKey = normalise(country);

  const photoId =
    CITY_IMAGES[cityKey] ||
    CITY_IMAGES[city?.toLowerCase() || ''] ||
    COUNTRY_IMAGES[countryKey] ||
    COUNTRY_IMAGES[country?.toLowerCase() || ''] ||
    FALLBACK_TRAVEL_IMAGES[index % FALLBACK_TRAVEL_IMAGES.length];

  return `https://images.unsplash.com/${photoId}?w=900&q=85&fit=crop&auto=format`;
}

export function isDeprecatedUnsplashUrl(url?: string | null): boolean {
  if (!url) return true;
  return url.includes('source.unsplash.com') || url.includes('unsplash.it');
}
