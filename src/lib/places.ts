export function extractPlaceTokens(input?: string | null): string[] {
  if (!input) return [];
  const raw = input
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\d+\.\d+\s*,\s*\d+\.\d+/g, '')
    .replace(/\n/g, ' ')
    .split(/→|\||•/g)
    .map((p) => p.trim())
    .filter(Boolean);

  const tokens: string[] = [];
  for (const part of raw) {
    const bits = part.split(',').map((b) => b.trim()).filter(Boolean);
    if (bits.length >= 2) {
      tokens.push(bits[bits.length - 2]);
      tokens.push(bits[bits.length - 1]);
    } else {
      tokens.push(part);
    }
  }

  const normalized = tokens
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1));

  return Array.from(new Set(normalized));
}

export function cleanPlaceTokens(tokens: string[]): string[] {
  const transportNoise = new Set([
    'train',
    'bus',
    'flight',
    'car',
    'ferry',
    'tram',
    'metro',
    'subway',
    'walk',
    'drive',
  ]);

  const cleaned = tokens
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !/\d/.test(t))
    .filter((t) => t.length > 2)
    .filter((t) => !/^[A-Z]{1,3}$/.test(t))
    .filter((t) => !transportNoise.has(t.toLowerCase()));

  return Array.from(new Set(cleaned));
}

export function collectDayPlaces(args: {
  dayPlace?: string | null;
  activityLocations?: (string | null | undefined)[];
  transitLocations?: (string | null | undefined)[];
  stayLocations?: (string | null | undefined)[];
}): string[] {
  const { dayPlace, activityLocations = [], transitLocations = [], stayLocations = [] } = args;
  const all = [dayPlace, ...activityLocations, ...transitLocations, ...stayLocations].filter(Boolean) as string[];
  const tokens = all.flatMap((v) => extractPlaceTokens(v));
  return Array.from(new Set(tokens));
}
