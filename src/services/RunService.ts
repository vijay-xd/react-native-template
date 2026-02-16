import { supabase } from '../lib/supabase';
import { Coordinate } from '../utils/geo';

// ─────────────────────────────────────────────
// RUN SERVICE — Save & Fetch Runs from Supabase
// ─────────────────────────────────────────────

export interface RunRecord {
    id?: string;
    user_id: string;
    distance_km: number;
    duration_sec: number;
    avg_pace: number;        // min/km
    avg_speed: number;       // km/h
    max_speed: number;       // km/h
    calories: number;
    route: Coordinate[];     // Full GPS path
    cells_captured: string[]; // H3 cell IDs captured
    started_at: string;
    finished_at: string;
    status: 'active' | 'paused' | 'finished';
}

/**
 * Save a completed run to Supabase.
 */
export async function saveRun(run: Omit<RunRecord, 'id'>): Promise<RunRecord | null> {
    const { data, error } = await supabase
        .from('runs')
        .insert({
            user_id: run.user_id,
            distance_km: run.distance_km,
            duration_sec: run.duration_sec,
            avg_pace: run.avg_pace,
            avg_speed: run.avg_speed,
            max_speed: run.max_speed,
            calories: run.calories,
            route: JSON.stringify(run.route),
            cells_captured: run.cells_captured,
            started_at: run.started_at,
            finished_at: run.finished_at,
            status: run.status,
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving run:', error);
        return null;
    }
    return data as unknown as RunRecord;
}

/**
 * Fetch recent runs for the current user.
 */
export async function fetchMyRuns(limit: number = 20): Promise<RunRecord[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('runs')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching runs:', error);
        return [];
    }

    return (data || []).map((r: any) => ({
        ...r,
        route: typeof r.route === 'string' ? JSON.parse(r.route) : (r.route || []),
    }));
}

/**
 * Update user profile stats after a run.
 */
export async function updateProfileAfterRun(
    distanceKm: number,
    xpEarned: number
) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Use RPC or do a manual increment
    const { data: profile } = await supabase
        .from('profiles')
        .select('total_distance_km, xp, level')
        .eq('user_id', user.id)
        .single();

    if (!profile) return;

    const newDistance = (profile.total_distance_km || 0) + distanceKm;
    const newXp = (profile.xp || 0) + xpEarned;
    const newLevel = Math.floor(newXp / 1000) + 1; // Simple: 1000 XP per level

    await supabase
        .from('profiles')
        .update({
            total_distance_km: newDistance,
            xp: newXp,
            level: newLevel,
        })
        .eq('user_id', user.id);
}

/**
 * Calculate XP earned from a run.
 * Base: 100 XP per km
 * Bonus: +50% for pace < 5 min/km
 * Bonus: +20% for group runs
 */
export function calculateXP(
    distanceKm: number,
    avgPace: number,
    isGroupRun: boolean = false
): number {
    let xp = Math.round(distanceKm * 100);

    // Speed bonus
    if (avgPace > 0 && avgPace < 5) {
        xp = Math.round(xp * 1.5);
    } else if (avgPace > 0 && avgPace < 6) {
        xp = Math.round(xp * 1.25);
    }

    // Group bonus
    if (isGroupRun) {
        xp = Math.round(xp * 1.2);
    }

    return Math.max(xp, 10); // Minimum 10 XP
}
