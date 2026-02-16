import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Coordinate,
    haversineDistance,
    calculatePace,
    calculateSpeed,
    estimateCalories,
} from '../utils/geo';

// ─────────────────────────────────────────────
// useRunTracker (WEB) — Simulated Run Engine
// Uses browser Geolocation API instead of expo-location
// ─────────────────────────────────────────────

export type RunState = 'idle' | 'running' | 'paused' | 'finished';

export interface RunStats {
    distanceKm: number;
    durationSec: number;
    currentPace: number;
    averagePace: number;
    currentSpeed: number;
    maxSpeed: number;
    averageSpeed: number;
    calories: number;
    elevationGain: number;
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

const MIN_DISTANCE_THRESHOLD_M = 3;

export function useRunTracker() {
    const [runState, setRunState] = useState<RunState>('idle');
    const [stats, setStats] = useState<RunStats>({ ...INITIAL_STATS });
    const [currentLocation, setCurrentLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const statsRef = useRef<RunStats>({ ...INITIAL_STATS });
    const runStateRef = useRef<RunState>('idle');
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const lastLocationRef = useRef<Coordinate | null>(null);

    useEffect(() => {
        runStateRef.current = runState;
    }, [runState]);

    const startTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            if (runStateRef.current !== 'running') return;
            statsRef.current = {
                ...statsRef.current,
                durationSec: statsRef.current.durationSec + 1,
                averagePace: calculatePace(statsRef.current.distanceKm, statsRef.current.durationSec + 1),
                averageSpeed: calculateSpeed(statsRef.current.distanceKm, statsRef.current.durationSec + 1),
                calories: estimateCalories(
                    (statsRef.current.durationSec + 1) / 60,
                    calculateSpeed(statsRef.current.distanceKm, statsRef.current.durationSec + 1)
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

    const handlePosition = useCallback((pos: GeolocationPosition) => {
        if (runStateRef.current !== 'running') return;

        const { latitude, longitude, altitude, speed, accuracy } = pos.coords;
        setCurrentLocation({ latitude, longitude });

        if (accuracy && accuracy > 30) return;

        const newPoint: Coordinate = {
            latitude,
            longitude,
            altitude,
            timestamp: pos.timestamp,
            speed,
            accuracy,
        };

        const lastPoint = lastLocationRef.current;
        if (lastPoint) {
            const segmentKm = haversineDistance(lastPoint.latitude, lastPoint.longitude, latitude, longitude);
            if (segmentKm * 1000 < MIN_DISTANCE_THRESHOLD_M) return;
            if (segmentKm * 1000 > 100) return;

            const instantSpeed = speed != null && speed >= 0
                ? speed * 3.6
                : calculateSpeed(segmentKm, (pos.timestamp - lastPoint.timestamp) / 1000);

            const newDistance = statsRef.current.distanceKm + segmentKm;
            const segmentPace = calculatePace(segmentKm, (pos.timestamp - lastPoint.timestamp) / 1000);

            statsRef.current = {
                ...statsRef.current,
                distanceKm: newDistance,
                currentSpeed: instantSpeed,
                currentPace: segmentPace > 0 && segmentPace < 30 ? segmentPace : statsRef.current.currentPace,
                maxSpeed: Math.max(statsRef.current.maxSpeed, instantSpeed),
                routePoints: [...statsRef.current.routePoints, newPoint],
            };
            setStats({ ...statsRef.current });
        } else {
            statsRef.current = { ...statsRef.current, routePoints: [newPoint] };
            setStats({ ...statsRef.current });
        }
        lastLocationRef.current = newPoint;
    }, []);

    const startRun = useCallback(async () => {
        const freshStats: RunStats = { ...INITIAL_STATS, routePoints: [], cellsCaptured: [], startedAt: new Date().toISOString() };
        statsRef.current = freshStats;
        lastLocationRef.current = null;
        setStats(freshStats);

        // Use browser Geolocation API
        if ('geolocation' in navigator) {
            try {
                navigator.geolocation.getCurrentPosition(
                    (pos) => setCurrentLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                    () => { },
                    { enableHighAccuracy: true }
                );
            } catch (e) { }

            const id = navigator.geolocation.watchPosition(handlePosition, () => { }, {
                enableHighAccuracy: true,
                maximumAge: 1000,
            });
            watchIdRef.current = id;
        }

        setRunState('running');
        startTimer();
    }, [handlePosition, startTimer]);

    const pauseRun = useCallback(() => {
        setRunState('paused');
        stopTimer();
    }, [stopTimer]);

    const resumeRun = useCallback(() => {
        setRunState('running');
        startTimer();
    }, [startTimer]);

    const stopRun = useCallback(() => {
        setRunState('finished');
        stopTimer();
        if (watchIdRef.current != null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        return { ...statsRef.current };
    }, [stopTimer]);

    const resetRun = useCallback(() => {
        stopTimer();
        if (watchIdRef.current != null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setRunState('idle');
        statsRef.current = { ...INITIAL_STATS };
        lastLocationRef.current = null;
        setStats({ ...INITIAL_STATS });
    }, [stopTimer]);

    useEffect(() => {
        return () => {
            stopTimer();
            if (watchIdRef.current != null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [stopTimer]);

    return { runState, stats, currentLocation, startRun, pauseRun, resumeRun, stopRun, resetRun };
}
