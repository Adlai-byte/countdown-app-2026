export interface City {
  id: string;
  name: string;
  country: string;
  timezone: string; // IANA timezone
  emoji: string;    // Country flag
}

export const CITIES: City[] = [
  // Pacific / Oceania (earliest)
  { id: 'auckland', name: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland', emoji: '🇳🇿' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', emoji: '🇦🇺' },
  { id: 'melbourne', name: 'Melbourne', country: 'Australia', timezone: 'Australia/Melbourne', emoji: '🇦🇺' },

  // Asia
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', emoji: '🇯🇵' },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', emoji: '🇰🇷' },
  { id: 'shanghai', name: 'Shanghai', country: 'China', timezone: 'Asia/Shanghai', emoji: '🇨🇳' },
  { id: 'hongkong', name: 'Hong Kong', country: 'Hong Kong', timezone: 'Asia/Hong_Kong', emoji: '🇭🇰' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', emoji: '🇸🇬' },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok', emoji: '🇹🇭' },
  { id: 'mumbai', name: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', emoji: '🇮🇳' },
  { id: 'delhi', name: 'Delhi', country: 'India', timezone: 'Asia/Kolkata', emoji: '🇮🇳' },
  { id: 'dubai', name: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai', emoji: '🇦🇪' },

  // Europe / Africa
  { id: 'moscow', name: 'Moscow', country: 'Russia', timezone: 'Europe/Moscow', emoji: '🇷🇺' },
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul', emoji: '🇹🇷' },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', emoji: '🇪🇬' },
  { id: 'paris', name: 'Paris', country: 'France', timezone: 'Europe/Paris', emoji: '🇫🇷' },
  { id: 'london', name: 'London', country: 'UK', timezone: 'Europe/London', emoji: '🇬🇧' },
  { id: 'berlin', name: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', emoji: '🇩🇪' },
  { id: 'rome', name: 'Rome', country: 'Italy', timezone: 'Europe/Rome', emoji: '🇮🇹' },
  { id: 'madrid', name: 'Madrid', country: 'Spain', timezone: 'Europe/Madrid', emoji: '🇪🇸' },
  { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam', emoji: '🇳🇱' },

  // Americas
  { id: 'saopaulo', name: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', emoji: '🇧🇷' },
  { id: 'buenosaires', name: 'Buenos Aires', country: 'Argentina', timezone: 'America/Argentina/Buenos_Aires', emoji: '🇦🇷' },
  { id: 'newyork', name: 'New York', country: 'USA', timezone: 'America/New_York', emoji: '🇺🇸' },
  { id: 'toronto', name: 'Toronto', country: 'Canada', timezone: 'America/Toronto', emoji: '🇨🇦' },
  { id: 'chicago', name: 'Chicago', country: 'USA', timezone: 'America/Chicago', emoji: '🇺🇸' },
  { id: 'denver', name: 'Denver', country: 'USA', timezone: 'America/Denver', emoji: '🇺🇸' },
  { id: 'mexicocity', name: 'Mexico City', country: 'Mexico', timezone: 'America/Mexico_City', emoji: '🇲🇽' },
  { id: 'losangeles', name: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles', emoji: '🇺🇸' },
  { id: 'vancouver', name: 'Vancouver', country: 'Canada', timezone: 'America/Vancouver', emoji: '🇨🇦' },

  // Pacific (latest)
  { id: 'honolulu', name: 'Honolulu', country: 'USA', timezone: 'Pacific/Honolulu', emoji: '🇺🇸' },
];

// Default cities to show
export const DEFAULT_CITIES = ['tokyo', 'london', 'newyork', 'losangeles'];

/**
 * Get city by ID
 */
export function getCityById(id: string): City | undefined {
  return CITIES.find(city => city.id === id);
}

/**
 * Search cities by name or country
 */
export function searchCities(query: string): City[] {
  const lowerQuery = query.toLowerCase();
  return CITIES.filter(
    city =>
      city.name.toLowerCase().includes(lowerQuery) ||
      city.country.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Sort cities by how soon they reach New Year (earliest first)
 */
export function sortCitiesByNewYear(cities: City[]): City[] {
  const now = new Date();
  const targetYear = now.getFullYear() + 1;

  return [...cities].sort((a, b) => {
    const timeA = getTimeUntilNewYear(a.timezone, targetYear);
    const timeB = getTimeUntilNewYear(b.timezone, targetYear);
    return timeA - timeB;
  });
}

/**
 * Get milliseconds until New Year for a timezone
 */
function getTimeUntilNewYear(timezone: string, targetYear: number): number {
  const now = new Date();
  const newYearDate = new Date(targetYear, 0, 1, 0, 0, 0);

  // Get current time in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0');

  const tzNow = new Date(
    getPart('year'),
    getPart('month') - 1,
    getPart('day'),
    getPart('hour'),
    getPart('minute'),
    getPart('second')
  );

  return newYearDate.getTime() - tzNow.getTime();
}
