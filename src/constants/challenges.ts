// ─────────────────────────────────────────────
// CHALLENGES & ACHIEVEMENTS — Definitions
// ─────────────────────────────────────────────

export type ChallengeType = 'daily' | 'weekly' | 'achievement';
export type ChallengeCategory = 'distance' | 'pace' | 'streak' | 'territory' | 'social' | 'milestone';

export interface ChallengeDefinition {
    id: string;
    type: ChallengeType;
    category: ChallengeCategory;
    title: string;
    description: string;
    icon: string;
    target: number;         // Target value to complete
    unit: string;           // Unit of measurement
    xpReward: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// ─── DAILY CHALLENGES ───
export const DAILY_CHALLENGES: ChallengeDefinition[] = [
    {
        id: 'daily_1km',
        type: 'daily',
        category: 'distance',
        title: 'Morning Warmup',
        description: 'Run 1 kilometer today',
        icon: '🌅',
        target: 1,
        unit: 'km',
        xpReward: 50,
        rarity: 'common',
    },
    {
        id: 'daily_3km',
        type: 'daily',
        category: 'distance',
        title: 'Daily Grind',
        description: 'Run 3 kilometers today',
        icon: '💪',
        target: 3,
        unit: 'km',
        xpReward: 100,
        rarity: 'common',
    },
    {
        id: 'daily_5km',
        type: 'daily',
        category: 'distance',
        title: 'Five Alive',
        description: 'Run 5 kilometers today',
        icon: '🔥',
        target: 5,
        unit: 'km',
        xpReward: 200,
        rarity: 'rare',
    },
    {
        id: 'daily_3cells',
        type: 'daily',
        category: 'territory',
        title: 'Land Grab',
        description: 'Capture 3 territory cells today',
        icon: '⬡',
        target: 3,
        unit: 'cells',
        xpReward: 75,
        rarity: 'common',
    },
    {
        id: 'daily_10cells',
        type: 'daily',
        category: 'territory',
        title: 'Hex Dominator',
        description: 'Capture 10 territory cells today',
        icon: '🏴',
        target: 10,
        unit: 'cells',
        xpReward: 200,
        rarity: 'rare',
    },
    {
        id: 'daily_pace_6',
        type: 'daily',
        category: 'pace',
        title: 'Speed Demon',
        description: 'Complete a run with avg pace under 6 min/km',
        icon: '⚡',
        target: 6,
        unit: 'min/km',
        xpReward: 150,
        rarity: 'rare',
    },
    {
        id: 'daily_2runs',
        type: 'daily',
        category: 'streak',
        title: 'Double Trouble',
        description: 'Complete 2 runs today',
        icon: '✌️',
        target: 2,
        unit: 'runs',
        xpReward: 100,
        rarity: 'common',
    },
    {
        id: 'daily_calories_300',
        type: 'daily',
        category: 'milestone',
        title: 'Calorie Crusher',
        description: 'Burn 300 calories in a single run',
        icon: '🔥',
        target: 300,
        unit: 'kcal',
        xpReward: 125,
        rarity: 'rare',
    },
];

// ─── WEEKLY CHALLENGES ───
export const WEEKLY_CHALLENGES: ChallengeDefinition[] = [
    {
        id: 'weekly_15km',
        type: 'weekly',
        category: 'distance',
        title: 'Weekly Warrior',
        description: 'Run 15 kilometers this week',
        icon: '🗓️',
        target: 15,
        unit: 'km',
        xpReward: 500,
        rarity: 'rare',
    },
    {
        id: 'weekly_30km',
        type: 'weekly',
        category: 'distance',
        title: 'Marathon Prep',
        description: 'Run 30 kilometers this week',
        icon: '🏅',
        target: 30,
        unit: 'km',
        xpReward: 1000,
        rarity: 'epic',
    },
    {
        id: 'weekly_5runs',
        type: 'weekly',
        category: 'streak',
        title: 'Consistency King',
        description: 'Complete 5 runs this week',
        icon: '👑',
        target: 5,
        unit: 'runs',
        xpReward: 400,
        rarity: 'rare',
    },
    {
        id: 'weekly_30cells',
        type: 'weekly',
        category: 'territory',
        title: 'Territory Tycoon',
        description: 'Capture 30 cells this week',
        icon: '🗺️',
        target: 30,
        unit: 'cells',
        xpReward: 600,
        rarity: 'epic',
    },
    {
        id: 'weekly_7day_streak',
        type: 'weekly',
        category: 'streak',
        title: 'Iron Will',
        description: 'Run every day this week (7-day streak)',
        icon: '🔗',
        target: 7,
        unit: 'days',
        xpReward: 750,
        rarity: 'epic',
    },
    {
        id: 'weekly_pace_sub5',
        type: 'weekly',
        category: 'pace',
        title: 'Lightning Week',
        description: 'Complete 3 runs with avg pace under 5 min/km',
        icon: '⚡',
        target: 3,
        unit: 'fast runs',
        xpReward: 800,
        rarity: 'epic',
    },
];

// ─── LIFETIME ACHIEVEMENTS ───
export const ACHIEVEMENTS: ChallengeDefinition[] = [
    // Distance milestones
    {
        id: 'ach_first_run',
        type: 'achievement',
        category: 'milestone',
        title: 'First Steps',
        description: 'Complete your first run',
        icon: '👟',
        target: 1,
        unit: 'runs',
        xpReward: 100,
        rarity: 'common',
    },
    {
        id: 'ach_10km_total',
        type: 'achievement',
        category: 'distance',
        title: 'Getting Started',
        description: 'Run a total of 10 kilometers',
        icon: '🌱',
        target: 10,
        unit: 'km',
        xpReward: 200,
        rarity: 'common',
    },
    {
        id: 'ach_50km_total',
        type: 'achievement',
        category: 'distance',
        title: 'Committed',
        description: 'Run a total of 50 kilometers',
        icon: '💎',
        target: 50,
        unit: 'km',
        xpReward: 500,
        rarity: 'rare',
    },
    {
        id: 'ach_100km_total',
        type: 'achievement',
        category: 'distance',
        title: 'Century Runner',
        description: 'Run a total of 100 kilometers',
        icon: '💯',
        target: 100,
        unit: 'km',
        xpReward: 1000,
        rarity: 'epic',
    },
    {
        id: 'ach_500km_total',
        type: 'achievement',
        category: 'distance',
        title: 'Ultra Legend',
        description: 'Run a total of 500 kilometers',
        icon: '🏔️',
        target: 500,
        unit: 'km',
        xpReward: 5000,
        rarity: 'legendary',
    },
    // Territory achievements
    {
        id: 'ach_first_cell',
        type: 'achievement',
        category: 'territory',
        title: 'Claim Maker',
        description: 'Capture your first territory cell',
        icon: '🏴',
        target: 1,
        unit: 'cells',
        xpReward: 50,
        rarity: 'common',
    },
    {
        id: 'ach_50_cells',
        type: 'achievement',
        category: 'territory',
        title: 'Hex Master',
        description: 'Capture 50 territory cells total',
        icon: '⬡',
        target: 50,
        unit: 'cells',
        xpReward: 500,
        rarity: 'rare',
    },
    {
        id: 'ach_200_cells',
        type: 'achievement',
        category: 'territory',
        title: 'Territory Overlord',
        description: 'Capture 200 territory cells total',
        icon: '👑',
        target: 200,
        unit: 'cells',
        xpReward: 2000,
        rarity: 'epic',
    },
    // Pace achievements
    {
        id: 'ach_sub5_pace',
        type: 'achievement',
        category: 'pace',
        title: 'Speed Unlocked',
        description: 'Complete a run with avg pace under 5:00 min/km',
        icon: '⚡',
        target: 5,
        unit: 'min/km',
        xpReward: 300,
        rarity: 'rare',
    },
    {
        id: 'ach_sub4_pace',
        type: 'achievement',
        category: 'pace',
        title: 'Blaze Runner',
        description: 'Complete a run with avg pace under 4:00 min/km',
        icon: '🔥',
        target: 4,
        unit: 'min/km',
        xpReward: 1000,
        rarity: 'legendary',
    },
    // Streak achievements
    {
        id: 'ach_3day_streak',
        type: 'achievement',
        category: 'streak',
        title: 'Momentum',
        description: 'Maintain a 3-day running streak',
        icon: '🔗',
        target: 3,
        unit: 'days',
        xpReward: 200,
        rarity: 'common',
    },
    {
        id: 'ach_7day_streak',
        type: 'achievement',
        category: 'streak',
        title: 'Week Warrior',
        description: 'Maintain a 7-day running streak',
        icon: '🔥',
        target: 7,
        unit: 'days',
        xpReward: 500,
        rarity: 'rare',
    },
    {
        id: 'ach_30day_streak',
        type: 'achievement',
        category: 'streak',
        title: 'Unstoppable',
        description: 'Maintain a 30-day running streak',
        icon: '💀',
        target: 30,
        unit: 'days',
        xpReward: 3000,
        rarity: 'legendary',
    },
    // Social achievements
    {
        id: 'ach_first_crew',
        type: 'achievement',
        category: 'social',
        title: 'Squad Up',
        description: 'Join your first crew',
        icon: '🛡️',
        target: 1,
        unit: 'crews',
        xpReward: 100,
        rarity: 'common',
    },
    {
        id: 'ach_group_run',
        type: 'achievement',
        category: 'social',
        title: 'Pack Runner',
        description: 'Complete a group run with friends',
        icon: '🏃‍♂️',
        target: 1,
        unit: 'group runs',
        xpReward: 200,
        rarity: 'rare',
    },
    {
        id: 'ach_10_friends',
        type: 'achievement',
        category: 'social',
        title: 'Social Butterfly',
        description: 'Add 10 friends',
        icon: '🦋',
        target: 10,
        unit: 'friends',
        xpReward: 300,
        rarity: 'rare',
    },
];

// ─── RARITY COLORS ───
export const RARITY_COLORS: Record<string, string> = {
    common: '#a0a0a0',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
};

export const RARITY_BG: Record<string, string> = {
    common: 'rgba(160,160,160,0.08)',
    rare: 'rgba(59,130,246,0.08)',
    epic: 'rgba(168,85,247,0.08)',
    legendary: 'rgba(245,158,11,0.08)',
};

// Helper to get all challenges by type
export function getChallengesByType(type: ChallengeType): ChallengeDefinition[] {
    switch (type) {
        case 'daily': return DAILY_CHALLENGES;
        case 'weekly': return WEEKLY_CHALLENGES;
        case 'achievement': return ACHIEVEMENTS;
    }
}

// Select today's daily challenges (rotate based on day of year)
export function getTodaysDailies(count: number = 4): ChallengeDefinition[] {
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const shuffled = [...DAILY_CHALLENGES].sort(
        (a, b) => hashCode(a.id + dayOfYear) - hashCode(b.id + dayOfYear)
    );
    return shuffled.slice(0, count);
}

// Select this week's weekly challenges
export function getThisWeeksWeeklies(count: number = 3): ChallengeDefinition[] {
    const weekNumber = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 604800000
    );
    const shuffled = [...WEEKLY_CHALLENGES].sort(
        (a, b) => hashCode(a.id + weekNumber) - hashCode(b.id + weekNumber)
    );
    return shuffled.slice(0, count);
}

function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash;
}
