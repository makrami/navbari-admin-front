export const CITY_COORDINATES: Record<string, [number, number]> = {
  "Hejiang, China": [105.8333, 28.8167],
  "Ningxia, China": [106.2309, 38.4872],
  "Inner Mongolia, Mongolia": [111.6708, 40.8182],
  "Shenzhen, China": [114.0579, 22.5431],
  "Guangzhou, China": [113.2644, 23.1291],
  "Urumqi, China": [87.6168, 43.8256],
  "Beijing, China": [116.4074, 39.9042],
  "Hohhot, China": [111.7519, 40.8414],
  "Ulaanbaatar, Mongolia": [106.9056, 47.8864],
  "Moscow, Russia": [37.6173, 55.7558],
  "Bratsk, Russia": [101.6167, 56.1167],
  "Istanbul, Turkey": [28.9784, 41.0082],
  "Sofia, Bulgaria": [23.3219, 42.6975],
  "Prague, Czech Republic": [14.4378, 50.0755],
  "Berlin, Germany": [13.405, 52.52],
  "Milan, Italy": [9.19, 45.4642],
  "Lyon, France": [4.8357, 45.764],
  "Calais, France": [1.8587, 50.9513],
  "London, UK": [-0.1278, 51.5074],
  "New York, USA": [-74.006, 40.7128],
  "Buffalo, USA": [-78.85, 42.8864],
  "Toronto, Canada": [-79.3832, 43.6532],
  "Novosibirsk, Russia": [82.9346, 55.0084],
};

const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
  China: "CN",
  Mongolia: "MN",
  Russia: "RU",
  Turkey: "TR",
  Bulgaria: "BG",
  "Czech Republic": "CZ",
  Germany: "DE",
  Italy: "IT",
  France: "FR",
  UK: "GB",
  USA: "US",
  Canada: "CA",
};

function normalizeCityKey(value: string | undefined | null): string | null {
  if (!value) return null;
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
}

const NORMALIZED_CITY_COORDINATES: Record<string, [number, number]> = Object
  .entries(CITY_COORDINATES)
  .reduce((acc, [label, coords]) => {
    const normalizedLabel = normalizeCityKey(label);
    if (normalizedLabel && !acc[normalizedLabel]) {
      acc[normalizedLabel] = coords;
    }
    const [cityOnly] = label.split(",");
    const normalizedCity = normalizeCityKey(cityOnly);
    if (normalizedCity && !acc[normalizedCity]) {
      acc[normalizedCity] = coords;
    }
    return acc;
  }, {} as Record<string, [number, number]>);

export function getCityCoordinates(
  cityName: string | undefined
): [number, number] | null {
  if (!cityName) return null;
  const normalized = normalizeCityKey(cityName);
  if (normalized && NORMALIZED_CITY_COORDINATES[normalized]) {
    return NORMALIZED_CITY_COORDINATES[normalized];
  }

  const parts = cityName.split(",").map((part) => normalizeCityKey(part));
  for (const part of parts) {
    if (part && NORMALIZED_CITY_COORDINATES[part]) {
      return NORMALIZED_CITY_COORDINATES[part];
    }
  }

  return null;
}

export function extractCountryName(place: string | undefined): string | null {
  if (!place) return null;
  const parts = place.split(",");
  const last = parts[parts.length - 1]?.trim();
  return last || null;
}

export function getIso2FromPlace(place: string | undefined): string | null {
  const countryName = extractCountryName(place);
  if (!countryName) return null;
  return COUNTRY_NAME_TO_ISO2[countryName] || null;
}

export function toFlagEmojiFromIso2(
  code: string | undefined | null
): string | null {
  if (!code) return null;
  const iso = code.trim().toUpperCase();
  if (iso.length !== 2) return null;
  const A = 0x41;
  const REGIONAL_BASE = 0x1f1e6;
  const chars = iso.split("");
  const first = REGIONAL_BASE + (chars[0].charCodeAt(0) - A);
  const second = REGIONAL_BASE + (chars[1].charCodeAt(0) - A);
  return String.fromCodePoint(first) + String.fromCodePoint(second);
}

