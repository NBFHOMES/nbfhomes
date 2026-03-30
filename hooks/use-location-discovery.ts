'use client';

import { useState, useEffect, useCallback } from 'react';
import { reverseGeocode, calculateDistance, GeoLocation } from '@/lib/geocoding';

const LOCATION_STORAGE_KEY = 'nbf_last_location';
const DISTANCE_THRESHOLD_KM = 10; // Only refresh if moved >10km

export function useLocationDiscovery() {
  const [location, setLocation] = useState<GeoLocation | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | 'loading'>('loading');

  // Check initial permission
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state);
        result.onchange = () => setPermissionState(result.state);
      });
    } else {
      setPermissionState('prompt');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || permissionState !== 'granted') return;

    // Use getCurrentPosition instead of watchPosition to prevent endless flickering
    const fetchInitialPosition = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lon } = position.coords;
          
          // Check if we already have this exact location cached to save API calls
          const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
          if (stored) {
            const lastLoc = JSON.parse(stored) as GeoLocation;
            const distance = calculateDistance(lat, lon, lastLoc.lat, lastLoc.lon);
            if (distance < 0.05) { // 50 meter threshold to prevent unnecessary geocoding
              setLocation(lastLoc);
              return; 
            }
          }

          const geoData = await reverseGeocode(lat, lon);
          if (geoData) {
            setLocation(geoData);
            localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(geoData));
          }
        },
        (err) => {
          console.error(`Geolocation error (highAccuracy=${highAccuracy}):`, err);
          if (highAccuracy && (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE)) {
            fetchInitialPosition(false); // Fallback to low accuracy
          } else {
            setError(err.message);
          }
        },
        { enableHighAccuracy: highAccuracy, timeout: highAccuracy ? 35000 : 15000, maximumAge: 60000 }
      );
    };

    // Only run this once when permission is granted
    fetchInitialPosition(true);
    
    // No cleanup needed for getCurrentPosition (unlike watchPosition)
  }, [permissionState]);

  const updateLocation = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setLoading(true);
    setError(null);
    localStorage.removeItem(LOCATION_STORAGE_KEY); // FORCE RE-FETCH

    const requestLocation = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lon } = position.coords;
          const geoData = await reverseGeocode(lat, lon);
          if (geoData) {
            setLocation(geoData);
            localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(geoData));
            setError(null);
          }
          setLoading(false);
        },
        (error) => {
          if (highAccuracy && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
            requestLocation(false); // Fallback to low accuracy
          } else {
            setError(error.message);
            setLoading(false);
          }
        },
        { enableHighAccuracy: highAccuracy, timeout: highAccuracy ? 35000 : 15000, maximumAge: 0 }
      );
    };

    requestLocation(true);
  }, []);

  return {
    location,
    loading,
    error,
    permissionState,
    updateLocation, // Allow manual refresh
  };
}
