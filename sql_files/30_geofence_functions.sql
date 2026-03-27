-- SQL Functions for Location discovery and Geofencing

-- 1. Calculate distance between two coordinates in KM
CREATE OR REPLACE FUNCTION calculate_distance(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float AS $$
DECLARE
    dist float = 0;
    rad_lat1 float;
    rad_lat2 float;
    theta float;
    rad_theta float;
BEGIN
    IF lat1 = lat2 AND lon1 = lon2 THEN
        RETURN 0;
    ELSE
        rad_lat1 = pi() * lat1 / 180;
        rad_lat2 = pi() * lat2 / 180;
        theta = lon1 - lon2;
        rad_theta = pi() * theta / 180;
        dist = sin(rad_lat1) * sin(rad_lat2) + cos(rad_lat1) * cos(rad_lat2) * cos(rad_theta);

        IF dist > 1 THEN dist = 1; END IF;

        dist = acos(dist);
        dist = dist * 180 / pi();
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344; -- Convert to kilometers

        RETURN dist;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Improved Nearby Properties Search (Radius fallback)
CREATE OR REPLACE FUNCTION get_nearby_properties(user_lat float, user_lng float, radius_meters float)
RETURNS SETOF properties AS $$
BEGIN
    -- First try with the given radius
    IF EXISTS (
        SELECT 1 FROM properties 
        WHERE status = 'approved' AND available_for_sale = true 
        AND (
            (6371 * acos(
                cos(radians(user_lat)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians(user_lng)) + 
                sin(radians(user_lat)) * sin(radians(latitude))
            )) * 1000
        ) <= radius_meters
    ) THEN
        RETURN QUERY 
        SELECT * FROM properties 
        WHERE status = 'approved' AND available_for_sale = true 
        AND (
            (6371 * acos(
                cos(radians(user_lat)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians(user_lng)) + 
                sin(radians(user_lat)) * sin(radians(latitude))
            )) * 1000
        ) <= radius_meters
        ORDER BY (
            (6371 * acos(
                cos(radians(user_lat)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians(user_lng)) + 
                sin(radians(user_lat)) * sin(radians(latitude))
            ))
        ) ASC;
    ELSE
        -- Fallback: Return the nearest properties regardless of radius
        RETURN QUERY 
        SELECT * FROM properties 
        WHERE status = 'approved' AND available_for_sale = true 
        ORDER BY (
            (6371 * acos(
                cos(radians(user_lat)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians(user_lng)) + 
                sin(radians(user_lat)) * sin(radians(latitude))
            ))
        ) ASC
        LIMIT 10;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Fetch unique cities with at least one approved property
CREATE OR REPLACE FUNCTION get_active_cities()
RETURNS TABLE(city_names text, property_count bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT city as city_names, count(*) as property_count
    FROM properties
    WHERE status = 'approved' AND available_for_sale = true AND city IS NOT NULL
    GROUP BY city
    ORDER BY property_count DESC;
END;
$$ LANGUAGE plpgsql;
