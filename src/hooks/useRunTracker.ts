import { useState, useRef, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import {
    Coordinate,
    haversineDistance,
    calculatePace,
    calculateSpeed,
    estimateCalories,
} from '../utils/geo';

// ─────────────────────────────────────────────
// useRunTracker — Core Run Engine Hook
// ─────────────────────────────────────────────

export type RunState = 'idle' | 'running' | 'paused' | 'finished';

export interface RunStats {
    distanceKm: number;
    durationSec: number;
    currentPace: number;    // min/km
    averagePace: number;    // min/km
    currentSpeed: number;   // km/h
    maxSpeed: number;       // km/h
    averageSpeed: number;   // km/h
    calories: number;
    elevationGain: number;  // meters
    routePoints: Coordinate[];
    cellsCaptured: string[];
    startedAt: string | null;
}

const INITIAL_STATS: RunStats = {
    distanceKm: 0,
    durationSec: 0,
    currentPace: 0,
    averagePace: 0,
    currentSpeed: 0,
    maxSpeed: 0,
    averageSpeed: 0,
    calories: 0,
    elevationGain: 0,
    routePoints: [],
    cellsCaptured: [],
    startedAt: null,
};

// Minimum distance between GPS points to count (meters)
// Filters GPS jitter when standing still
const MIN_DISTANCE_THRESHOLD_M = 3;

// Minimum accuracy to accept a GPS fix (meters)
const MAX_ACCURACY_THRESHOLD_M = 30;

export function useRunTracker() {
    const [runState, setRunState] = useState<RunState>('idle');
    const [stats, setStats] = useState<RunStats>({ ...INITIAL_STATS });
    const [currentLocation, setCurrentLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    // Refs to avoid stale closures in the location callback
    const statsRef = useRef<RunStats>({ ...INITIAL_STATS });
    const runStateRef = useRef<RunState>('idle');
    const locationSubRef = useRef<Location.LocationSubscription | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastLocationRef = useRef<Coordinate | null>(null);

    // Keep refs in sync with state
    useEffect(() => {
        runStateRef.current = runState;
    }, [runState]);

    // ─── Timer (updates duration every second) ───
    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            if (runStateRef.current !== 'running') return;

            statsRef.current = {
                ...statsRef.current,
                durationSec: statsRef.current.durationSec + 1,
                // Recalculate avg pace/speed based on accumulated duration
                averagePace: calculatePace(
                    statsRef.current.distanceKm,
                    statsRef.current.durationSec + 1
                ),
                averageSpeed: calculateSpeed(
                    statsRef.current.distanceKm,
                    statsRef.current.durationSec + 1
                ),
                // Update calories
                calories: estimateCalories(
                    (statsRef.current.durationSec + 1) / 60,
                    calculateSpeed(
                        statsRef.current.distanceKm,
                        statsRef.current.durationSec + 1
                    )
                ),
            };

            setStats({ ...statsRef.current });
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // ─── GPS Location Handler ───
    const handleLocationUpdate = useCallback((location: Location.LocationObject) => {
        if (runStateRef.current !== 'running') return;

        const { latitude, longitude, altitude, speed, accuracy } = location.coords;
        const timestamp = location.timestamp;

        // Update current position for the map
        setCurrentLocation({ latitude, longitude });

        // Filter out inaccurate fixes
        if (accuracy && accuracy > MAX_ACCURACY_THRESHOLD_M) {
            return;
        }

        const newPoint: Coordinate = {
            latitude,
            longitude,
            altitude,
            timestamp,
            speed,
            accuracy,
        };

        const lastPoint = lastLocationRef.current;

        if (lastPoint) {
            const segmentKm = haversineDistance(
                lastPoint.latitude, lastPoint.longitude,
                latitude, longitude
            );

            const segmentM = segmentKm * 1000;

            // Filter GPS jitter
            if (segmentM < MIN_DISTANCE_THRESHOLD_M) {
                return;
            }

            // Filter teleportation (> 100m in single update = GPS glitch)
            if (segmentM > 100) {
                console.warn('GPS teleportation detected, skipping point');
                return;
            }

            // Calculate segment speed from GPS (if available)
            const instantSpeed = speed != null && speed >= 0
                ? speed * 3.6  // m/s → km/h
                : calculateSpeed(segmentKm, (timestamp - lastPoint.timestamp) / 1000);

            // Elevation gain
            let elevGain = 0;
            if (altitude != null && lastPoint.altitude != null) {
                const elevDiff = altitude - lastPoint.altitude;
                if (elevDiff > 0) elevGain = elevDiff;
            }

            // Update stats
            const newDistance = statsRef.current.distanceKm + segmentKm;
            const segmentPace = calculatePace(
                segmentKm,
                (timestamp - lastPoint.timestamp) / 1000
            );

            statsRef.current = {
                ...statsRef.current,
                distanceKm: newDistance,
                currentSpeed: instantSpeed,
                currentPace: segmentPace > 0 && segmentPace < 30 ? segmentPace : statsRef.current.currentPace,
                maxSpeed: Math.max(statsRef.current.maxSpeed, instantSpeed),
                elevationGain: statsRef.current.elevationGain + elevGain,
                routePoints: [...statsRef.current.routePoints, newPoint],
            };

            setStats({ ...statsRef.current });
        } else {
            // First point — just record it
            statsRef.current = {
                ...statsRef.current,
                routePoints: [newPoint],
            };
            setStats({ ...statsRef.current });
        }

        lastLocationRef.current = newPoint;
    }, []);

    // ─── Start Location Tracking ───
    const startLocationTracking = useCallback(async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.warn('Location permission denied');
            return false;
        }

        // Get initial position
        try {
            const initial = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            setCurrentLocation({
                latitude: initial.coords.latitude,
                longitude: initial.coords.longitude,
            });
        } catch (err) {
            console.warn('Could not get initial position:', err);
        }

        // Start watching position
        const sub = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 1000,       // Update every 1s
                distanceInterval: 2,       // Or every 2m moved
            },
            handleLocationUpdate
        );

        locationSubRef.current = sub;
        return true;
    }, [handleLocationUpdate]);

    const stopLocationTracking = useCallback(() => {
        if (locationSubRef.current) {
            locationSubRef.current.remove();
            locationSubRef.current = null;
        }
    }, []);

    // ─── Public API ───

    const startRun = useCallback(async () => {
        // Reset stats
        const freshStats: RunStats = {
            ...INITIAL_STATS,
            routePoints: [],
            cellsCaptured: [],
            startedAt: new Date().toISOString(),
        };
        statsRef.current = freshStats;
        lastLocationRef.current = null;
        setStats(freshStats);

        // Start tracking
        const granted = await startLocationTracking();
        if (!granted) {
            console.warn('Cannot start run without location permission');
            return;
        }

        setRunState('running');
        startTimer();
    }, [startLocationTracking, startTimer]);

    const pauseRun = useCallback(() => {
        setRunState('paused');
        stopTimer();
        // Keep location tracking alive but ignore updates (handled by runStateRef check)
    }, [stopTimer]);

    const resumeRun = useCallback(() => {
        setRunState('running');
        startTimer();
    }, [startTimer]);

    const stopRun = useCallback(() => {
        setRunState('finished');
        stopTimer();
        stopLocationTracking();

        // Final stats snapshot
        const finalStats = { ...statsRef.current };
        setStats(finalStats);

        return finalStats;
    }, [stopTimer, stopLocationTracking]);

    const resetRun = useCallback(() => {
        stopTimer();
        stopLocationTracking();
        setRunState('idle');
        statsRef.current = { ...INITIAL_STATS };
        lastLocationRef.current = null;
        setStats({ ...INITIAL_STATS });
    }, [stopTimer, stopLocationTracking]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopTimer();
            stopLocationTracking();
        };
    }, [stopTimer, stopLocationTracking]);

    return {
        // State
        runState,
        stats,
        currentLocation,

        // Actions
        startRun,
        pauseRun,
        resumeRun,
        stopRun,
        resetRun,
    };
}
