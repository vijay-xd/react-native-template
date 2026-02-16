import { useState, useRef, useCallback } from 'react';
import { latLngToCell } from 'h3-js';

// ─────────────────────────────────────────────
// useTerritoryCapture (WEB) — Local-only version
// No Mapbox, no captureCell RPC — just H3 cell detection
// ─────────────────────────────────────────────

const H3_RESOLUTION = 9;

export interface CapturedCell {
    cellId: string;
    lat: number;
    lng: number;
    timestamp: number;
    isNew: boolean;
    wasStolen: boolean;
}

export interface TerritoryStats {
    cellsCaptured: string[];
    newCellsThisRun: number;
    stolenCellsThisRun: number;
    totalCellsVisited: number;
    lastCapturedCell: CapturedCell | null;
}

const INITIAL_TERRITORY_STATS: TerritoryStats = {
    cellsCaptured: [],
    newCellsThisRun: 0,
    stolenCellsThisRun: 0,
    totalCellsVisited: 0,
    lastCapturedCell: null,
};

const CAPTURE_DWELL_MS = 2000;
const CAPTURE_COOLDOWN_MS = 1000;

export function useTerritoryCapture(userId?: string) {
    const [territoryStats, setTerritoryStats] = useState<TerritoryStats>({ ...INITIAL_TERRITORY_STATS });
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureQueue, setCaptureQueue] = useState<CapturedCell[]>([]);

    const currentCellRef = useRef<string | null>(null);
    const cellEntryTimeRef = useRef<number>(0);
    const capturedSetRef = useRef<Set<string>>(new Set());
    const visitedSetRef = useRef<Set<string>>(new Set());
    const lastCaptureTimeRef = useRef<number>(0);
    const statsRef = useRef<TerritoryStats>({ ...INITIAL_TERRITORY_STATS });
    const captureQueueRef = useRef<CapturedCell[]>([]);

    const onLocationUpdate = useCallback(async (latitude: number, longitude: number) => {
        const cellId = latLngToCell(latitude, longitude, H3_RESOLUTION);
        const now = Date.now();

        visitedSetRef.current.add(cellId);

        if (cellId !== currentCellRef.current) {
            currentCellRef.current = cellId;
            cellEntryTimeRef.current = now;
            return;
        }

        const dwellTime = now - cellEntryTimeRef.current;
        if (dwellTime < CAPTURE_DWELL_MS) return;
        if (capturedSetRef.current.has(cellId)) return;
        if (now - lastCaptureTimeRef.current < CAPTURE_COOLDOWN_MS) return;

        capturedSetRef.current.add(cellId);
        lastCaptureTimeRef.current = now;

        const capturedCell: CapturedCell = {
            cellId,
            lat: latitude,
            lng: longitude,
            timestamp: now,
            isNew: true,
            wasStolen: false,
        };

        // Web: just track locally (no Supabase RPC)
        console.log('[Web] Cell captured locally:', cellId);

        const updatedCells = [...statsRef.current.cellsCaptured, cellId];
        const newStats: TerritoryStats = {
            cellsCaptured: updatedCells,
            newCellsThisRun: statsRef.current.newCellsThisRun + 1,
            stolenCellsThisRun: statsRef.current.stolenCellsThisRun,
            totalCellsVisited: visitedSetRef.current.size,
            lastCapturedCell: capturedCell,
        };

        statsRef.current = newStats;
        setTerritoryStats(newStats);

        captureQueueRef.current = [...captureQueueRef.current, capturedCell];
        setCaptureQueue([...captureQueueRef.current]);
    }, [userId]);

    const dismissCapture = useCallback(() => {
        captureQueueRef.current = captureQueueRef.current.slice(1);
        setCaptureQueue([...captureQueueRef.current]);
    }, []);

    const resetTerritory = useCallback(() => {
        currentCellRef.current = null;
        cellEntryTimeRef.current = 0;
        capturedSetRef.current = new Set();
        visitedSetRef.current = new Set();
        lastCaptureTimeRef.current = 0;
        captureQueueRef.current = [];
        statsRef.current = { ...INITIAL_TERRITORY_STATS };
        setTerritoryStats({ ...INITIAL_TERRITORY_STATS });
        setCaptureQueue([]);
        setIsCapturing(false);
    }, []);

    const getCurrentCell = useCallback(() => currentCellRef.current, []);

    return {
        territoryStats,
        isCapturing,
        captureQueue,
        onLocationUpdate,
        dismissCapture,
        resetTerritory,
        getCurrentCell,
    };
}
