import { supabase } from '../lib/supabase';
import {
    ChallengeDefinition,
    getTodaysDailies,
    getThisWeeksWeeklies,
    ACHIEVEMENTS,
} from '../constants/challenges';

// ─────────────────────────────────────────────
// CHALLENGE SERVICE — Progress Tracking
// ─────────────────────────────────────────────

export interface ChallengeProgress {
    challengeId: string;
    currentValue: number;
    completed: boolean;
    completedAt?: string;
    claimed: boolean;
}

export interface UserChallengeState {
    dailies: (ChallengeDefinition & ChallengeProgress)[];
    weeklies: (ChallengeDefinition & ChallengeProgress)[];
    achievements: (ChallengeDefinition & ChallengeProgress)[];
    recentUnlocks: ChallengeDefinition[];
}

/**
 * Fetch the user's challenge progress from Supabase.
 * Falls back to local state if DB is unavailable.
 */
export async function fetchChallengeProgress(): Promise<ChallengeProgress[]> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('challenge_progress')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
            console.warn('Challenge progress fetch failed:', error.message);
            return [];
        }

        return (data || []).map((row: any) => ({
            challengeId: row.challenge_id,
            currentValue: row.current_value || 0,
            completed: row.completed || false,
            completedAt: row.completed_at,
            claimed: row.claimed || false,
        }));
    } catch {
        return [];
    }
}

/**
 * Build the full challenge state for UI display.
 */
export function buildChallengeState(progress: ChallengeProgress[]): UserChallengeState {
    const progressMap = new Map(progress.map(p => [p.challengeId, p]));

    const enrichChallenge = (def: ChallengeDefinition) => {
        const prog = progressMap.get(def.id) || {
            challengeId: def.id,
            currentValue: 0,
            completed: false,
            claimed: false,
        };
        return { ...def, ...prog };
    };

    const dailies = getTodaysDailies(4).map(enrichChallenge);
    const weeklies = getThisWeeksWeeklies(3).map(enrichChallenge);
    const achievements = ACHIEVEMENTS.map(enrichChallenge);

    const recentUnlocks = achievements
        .filter(a => a.completed && a.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
        .slice(0, 5);

    return { dailies, weeklies, achievements, recentUnlocks };
}

/**
 * Update challenge progress after a run.
 * Checks all active challenges against run results.
 */
export async function updateChallengesAfterRun(runData: {
    distanceKm: number;
    durationSec: number;
    avgPace: number;
    calories: number;
    cellsCaptured: number;
    totalDistanceKm: number;  // Lifetime total
    totalRuns: number;        // Lifetime total
    totalCells: number;       // Lifetime total
    currentStreak: number;    // Current streak in days
}): Promise<ChallengeDefinition[]> {
    const newlyCompleted: ChallengeDefinition[] = [];

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return newlyCompleted;

        // Get all challenges to check
        const allChallenges = [
            ...getTodaysDailies(4),
            ...getThisWeeksWeeklies(3),
            ...ACHIEVEMENTS,
        ];

        for (const challenge of allChallenges) {
            const value = getChallengeValue(challenge, runData);
            if (value <= 0) continue;

            const completed = isChallengeComplete(challenge, value);

            // Upsert progress
            try {
                await supabase
                    .from('challenge_progress')
                    .upsert({
                        user_id: user.id,
                        challenge_id: challenge.id,
                        current_value: value,
                        completed,
                        completed_at: completed ? new Date().toISOString() : null,
                    }, {
                        onConflict: 'user_id,challenge_id',
                    });
            } catch (err) {
                // Silently fail in dev mode
                console.warn('Challenge upsert failed:', err);
            }

            if (completed) {
                newlyCompleted.push(challenge);
            }
        }
    } catch (err) {
        console.warn('Challenge update failed:', err);
    }

    return newlyCompleted;
}

/**
 * Claim the XP reward for a completed challenge.
 */
export async function claimChallengeReward(challengeId: string, xpReward: number): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        // Mark as claimed
        await supabase
            .from('challenge_progress')
            .update({ claimed: true })
            .eq('user_id', user.id)
            .eq('challenge_id', challengeId);

        // Add XP to profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('xp, level')
            .eq('user_id', user.id)
            .single();

        if (profile) {
            const newXp = (profile.xp || 0) + xpReward;
            const newLevel = Math.floor(newXp / 1000) + 1;

            await supabase
                .from('profiles')
                .update({ xp: newXp, level: newLevel })
                .eq('user_id', user.id);
        }

        return true;
    } catch {
        return false;
    }
}

// ─── HELPERS ───

function getChallengeValue(
    challenge: ChallengeDefinition,
    data: {
        distanceKm: number;
        durationSec: number;
        avgPace: number;
        calories: number;
        cellsCaptured: number;
        totalDistanceKm: number;
        totalRuns: number;
        totalCells: number;
        currentStreak: number;
    }
): number {
    switch (challenge.category) {
        case 'distance':
            if (challenge.type === 'achievement') return data.totalDistanceKm;
            return data.distanceKm;
        case 'pace':
            return data.avgPace > 0 ? data.avgPace : 0;
        case 'territory':
            if (challenge.type === 'achievement') return data.totalCells;
            return data.cellsCaptured;
        case 'streak':
            if (challenge.unit === 'days') return data.currentStreak;
            return data.totalRuns;
        case 'milestone':
            if (challenge.unit === 'runs') return data.totalRuns;
            if (challenge.unit === 'kcal') return data.calories;
            return 0;
        case 'social':
            return 0; // Handled separately
        default:
            return 0;
    }
}

function isChallengeComplete(challenge: ChallengeDefinition, value: number): boolean {
    // For pace challenges, lower is better
    if (challenge.category === 'pace') {
        return value > 0 && value < challenge.target;
    }
    return value >= challenge.target;
}
