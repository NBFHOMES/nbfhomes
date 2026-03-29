/**
 * Geocoding utilities using OpenStreetMap (Nominatim)
 */

export interface GeoLocation {
  lat: number;
  lon: number;
  city?: string;
  name?: string;
  area?: string; // New field for sub-locality
  display_name?: string;
}

/**
 * Reverse geocode coordinates to a city/area name
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeoLocation | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

  try {
    // Zoom 18 for street-level precision
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'NBFHomes-App' },
      // Use no-store for geocoding to ensure accuracy when user moves
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    
    // Extract city or most relevant area name
    const address = data.address;
    if (!address) return null;

    const city = address.city || address.town || address.village || address.suburb || address.county;
    const area = address.suburb || address.neighbourhood || address.residential || address['sub-district'] || address.city_district;
    
    return {
      lat,
      lon,
      city: city || 'Unknown City',
      area: area || city || 'Unknown Area',
      name: area || city,
      display_name: data.display_name
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn('Geocoding request timed out');
    } else {
      console.error('Reverse Geocoding Error:', error.message);
    }
    return null;
  }
}

/**
 * Calculate distance between two points in kilometers (Haversine Formula)
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
