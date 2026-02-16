// ─────────────────────────────────────────────
// GEO UTILITIES — Distance, Pace, Speed
// ─────────────────────────────────────────────

const EARTH_RADIUS_KM = 6371;

/**
 * Haversine formula to calculate distance between two GPS coordinates.
 * Returns distance in kilometers.
 */
export function haversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
}

/**
 * Calculate pace in minutes per kilometer.
 * @param distanceKm Total distance in km
 * @param durationSec Total duration in seconds
 * @returns Pace in min/km (e.g., 5.5 means 5:30/km)
 */
export function calculatePace(distanceKm: number, durationSec: number): number {
    if (distanceKm <= 0) return 0;
    return (durationSec / 60) / distanceKm;
}

/**
 * Format pace number to "M'SS" string (e.g., 5.5 → "5'30")
 */
export function formatPace(paceMinPerKm: number): string {
    if (paceMinPerKm <= 0 || !isFinite(paceMinPerKm)) return "0'00\"";
    const mins = Math.floor(paceMinPerKm);
    const secs = Math.round((paceMinPerKm - mins) * 60);
    return `${mins}'${String(secs).padStart(2, '0')}"`;
}

/**
 * Calculate speed in km/h.
 */
export function calculateSpeed(distanceKm: number, durationSec: number): number {
    if (durationSec <= 0) return 0;
    return (distanceKm / durationSec) * 3600;
}

/**
 * Format duration in seconds to "H:MM:SS" or "MM:SS"
 */
export function formatDuration(totalSeconds: number): string {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);

    if (hrs > 0) {
        return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format distance to a readable string.
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(2)}km`;
}

/**
 * Estimate calories burned during a run.
 * Uses MET (Metabolic Equivalent of Task) approximation.
 * Running MET ~= 8-12 depending on speed.
 * @param weightKg Runner's weight in kg (default 70)
 * @param durationMin Duration in minutes
 * @param speedKmh Speed in km/h
 */
export function estimateCalories(
    durationMin: number,
    speedKmh: number,
    weightKg: number = 70
): number {
    // MET approximation for running: roughly speed_kmh * 1.0 for simplicity
    // More accurate: MET = 1.2 * speed_mph (convert kmh to mph first)
    // Simplified: MET ≈ speed_kmh / 1.6 * 1.2
    let met = 1;
    if (speedKmh < 6) met = 6; // jogging
    else if (speedKmh < 8) met = 8;
    else if (speedKmh < 10) met = 10;
    else if (speedKmh < 12) met = 11.5;
    else met = 13;

    // Calories = MET × weight(kg) × duration(hours)
    return met * weightKg * (durationMin / 60);
}

export type Coordinate = {
    latitude: number;
    longitude: number;
    altitude?: number | null;
    timestamp: number;
    speed?: number | null;
    accuracy?: number | null;
};
