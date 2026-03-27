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

    let watchId: number;

    const startWatching = (highAccuracy: boolean) => {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude: lat, longitude: lon } = position.coords;
          const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
          if (stored) {
            const lastLoc = JSON.parse(stored) as GeoLocation;
            const distance = calculateDistance(lat, lon, lastLoc.lat, lastLoc.lon);
            if (distance < 0.01) return; // 10 meter threshold
          }

          const geoData = await reverseGeocode(lat, lon);
          if (geoData) {
            setLocation(geoData);
            localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(geoData));
          }
        },
        (err) => {
          console.error(`Geolocation watch error (highAccuracy=${highAccuracy}):`, err);
          if (highAccuracy && (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE)) {
            navigator.geolocation.clearWatch(watchId);
            startWatching(false); // Fallback to low accuracy
          } else {
            setError(err.message);
          }
        },
        { enableHighAccuracy: highAccuracy, timeout: highAccuracy ? 35000 : 15000, maximumAge: 0 }
      );
    };

    startWatching(true);
    return () => navigator.geolocation.clearWatch(watchId);
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
