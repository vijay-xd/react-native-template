import { useState, useRef, useCallback } from 'react';
import { getH3CellForLocation, captureCell } from '../services/MapService';

// ─────────────────────────────────────────────
// useTerritoryCapture — Real-Time Cell Detection
// Detects H3 hex cells as runner moves through them
// and triggers territory capture via Supabase
// ─────────────────────────────────────────────

export interface CapturedCell {
    cellId: string;
    lat: number;
    lng: number;
    timestamp: number;
    isNew: boolean;      // true if first time capturing this cell
    wasStolen: boolean;  // true if captured from another player
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

// Minimum dwell time in a cell before capture triggers (ms)
const CAPTURE_DWELL_MS = 2000;

// Cooldown between captures to prevent spam (ms)
const CAPTURE_COOLDOWN_MS = 1000;

export function useTerritoryCapture(userId?: string) {
    const [territoryStats, setTerritoryStats] = useState<TerritoryStats>({
        ...INITIAL_TERRITORY_STATS,
    });
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureQueue, setCaptureQueue] = useState<CapturedCell[]>([]);

    // Track which cell the runner is currently in
    const currentCellRef = useRef<string | null>(null);
    // When they entered the current cell
    const cellEntryTimeRef = useRef<number>(0);
    // Set of already captured cells this run (to avoid re-captures)
    const capturedSetRef = useRef<Set<string>>(new Set());
    // Set of all visited cells (including ones we didn't capture)
    const visitedSetRef = useRef<Set<string>>(new Set());
    // Cooldown tracking
    const lastCaptureTimeRef = useRef<number>(0);
    // Stats ref to avoid stale closures
    const statsRef = useRef<TerritoryStats>({ ...INITIAL_TERRITORY_STATS });
    // Queue of pending capture notifications
    const captureQueueRef = useRef<CapturedCell[]>([]);

    /**
     * Call this every time the runner's GPS position updates.
     * It detects which H3 cell they're in and triggers capture logic.
     */
    const onLocationUpdate = useCallback(
        async (latitude: number, longitude: number) => {
            const cellId = getH3CellForLocation(latitude, longitude);
            const now = Date.now();

            // Track visited cells
            visitedSetRef.current.add(cellId);

            // Check if we moved to a new cell
            if (cellId !== currentCellRef.current) {
                currentCellRef.current = cellId;
                cellEntryTimeRef.current = now;
                return; // Start dwell timer for the new cell
            }

            // Still in the same cell — check if dwell time is met
            const dwellTime = now - cellEntryTimeRef.current;
            if (dwellTime < CAPTURE_DWELL_MS) {
                return; // Not long enough
            }

            // Check if already captured this cell
            if (capturedSetRef.current.has(cellId)) {
                return; // Already got it
            }

            // Check cooldown
            if (now - lastCaptureTimeRef.current < CAPTURE_COOLDOWN_MS) {
                return; // Too soon after last capture
            }

            // ── CAPTURE THE CELL ──
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

            // Try to capture via Supabase (fire-and-forget, don't block the run)
            setIsCapturing(true);
            try {
                await captureCell(cellId, latitude, longitude);
                capturedCell.isNew = true;
            } catch (error: any) {
                // If RPC fails (e.g., dev mode), still count it locally
                console.warn('Cell capture API failed (dev mode?):', error?.message);
            }
            setIsCapturing(false);

            // Update stats
            const updatedCells = [...statsRef.current.cellsCaptured, cellId];
            const newStats: TerritoryStats = {
                cellsCaptured: updatedCells,
                newCellsThisRun: statsRef.current.newCellsThisRun + 1,
                stolenCellsThisRun: capturedCell.wasStolen
                    ? statsRef.current.stolenCellsThisRun + 1
                    : statsRef.current.stolenCellsThisRun,
                totalCellsVisited: visitedSetRef.current.size,
                lastCapturedCell: capturedCell,
            };

            statsRef.current = newStats;
            setTerritoryStats(newStats);

            // Add to notification queue
            captureQueueRef.current = [...captureQueueRef.current, capturedCell];
            setCaptureQueue([...captureQueueRef.current]);
        },
        [userId]
    );

    /**
     * Dismiss the oldest capture notification from the queue.
     */
    const dismissCapture = useCallback(() => {
        captureQueueRef.current = captureQueueRef.current.slice(1);
        setCaptureQueue([...captureQueueRef.current]);
    }, []);

    /**
     * Reset all territory tracking state for a new run.
     */
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

    /**
     * Get the current cell the runner is in (for UI display).
     */
    const getCurrentCell = useCallback(() => {
        return currentCellRef.current;
    }, []);

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
