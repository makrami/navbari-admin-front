export const CITY_COORDINATES: Record<string, [number, number]> = {
  // China cities
  "Beijing, China": [116.4074, 39.9042],
  "Shanghai, China": [121.4737, 31.2304],
  "Guangzhou, China": [113.2644, 23.1291],
  "Shenzhen, China": [114.0579, 22.5431],
  "Xi'an, China": [108.9398, 34.3416],
  "Urumqi, China": [87.6168, 43.8256],
  "Hohhot, China": [111.7519, 40.8414],
  "Hejiang, China": [105.8333, 28.8167],
  "Ningxia, China": [106.2309, 38.4872],
  // Russia cities
  "Moscow, Russia": [37.6173, 55.7558],
  "Saint Petersburg, Russia": [30.3159, 59.9343],
  "Novosibirsk, Russia": [82.9346, 55.0084],
  "Yekaterinburg, Russia": [60.6122, 56.8431],
  "Kazan, Russia": [49.1052, 55.8304],
  "Bratsk, Russia": [101.6167, 56.1167],
  // Iran - Tehran
  "Tehran, Iran": [51.3890, 35.6892],
  // Kazakhstan cities
  "Almaty, Kazakhstan": [76.9126, 43.2220],
  "Astana, Kazakhstan": [71.4306, 51.1694],
  "Shymkent, Kazakhstan": [69.5901, 42.3416],
  // Turkey cities
  "Istanbul, Turkey": [28.9784, 41.0082],
  "Ankara, Turkey": [32.8597, 39.9334],
  "Izmir, Turkey": [27.1428, 38.4237],
};

const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
  China: "CN",
  Russia: "RU",
  Iran: "IR",
  Kazakhstan: "KZ",
  Turkey: "TR",
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

