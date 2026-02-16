/**
 * Runnit - Progression & Gamification Constants
 * Based on the user's design screenshots.
 */

export type ProgressionTitle = {
    level: string;
    title: string;
    xpRequired: number;
    perk: string;
};

export const PROGRESSION_TITLES: ProgressionTitle[] = [
    { level: '1-2', title: 'Rookie', xpRequired: 0, perk: 'Basic territory capture' },
    { level: '3-4', title: 'Scout', xpRequired: 900, perk: 'Profile badge' },
    { level: '5-9', title: 'Pathfinder', xpRequired: 2500, perk: 'Custom avatar border' },
    { level: '10-14', title: 'Street Runner', xpRequired: 10000, perk: 'Leaderboard highlight' },
    { level: '15-19', title: 'Street Commander', xpRequired: 22500, perk: 'Crew invite priority' },
    { level: '20-29', title: 'Territory King', xpRequired: 40000, perk: 'Map name tag' },
    { level: '30-39', title: 'Zone Ruler', xpRequired: 90000, perk: 'Season legacy banner' },
    { level: '40-49', title: 'City Dominator', xpRequired: 160000, perk: 'City-wide visibility' },
    { level: '50+', title: 'Legend 👑', xpRequired: 250000, perk: 'Permanent map marker' },
];

export type RunnerTrait = {
    trait: string;
    unlockCondition: string;
    effect: string;
    icon: string;
};

export const RUNNER_TRAITS: RunnerTrait[] = [
    {
        trait: 'Night Runner',
        unlockCondition: '10 runs between 8 PM – 5 AM',
        effect: '+10% XP on night runs',
        icon: '🌙',
    },
    {
        trait: 'Explorer',
        unlockCondition: '20 unique cells captured',
        effect: '+1 cell capture radius',
        icon: '🧭',
    },
    {
        trait: 'Defender',
        unlockCondition: 'Hold territory for 7 days',
        effect: '-20% territory loss rate',
        icon: '🛡️',
    },
    {
        trait: 'Sprinter',
        unlockCondition: '10 runs with pace < 5 min/km',
        effect: '+15% faster cell capture',
        icon: '⚡',
    },
    {
        trait: 'Strategist',
        unlockCondition: 'Win 5 crew wars',
        effect: '+10% crew war score',
        icon: '🌓',
    },
];

/**
 * Get the current title for a given level.
 */
export function getTitleForLevel(level: number): ProgressionTitle {
    if (level >= 50) return PROGRESSION_TITLES[8];
    if (level >= 40) return PROGRESSION_TITLES[7];
    if (level >= 30) return PROGRESSION_TITLES[6];
    if (level >= 20) return PROGRESSION_TITLES[5];
    if (level >= 15) return PROGRESSION_TITLES[4];
    if (level >= 10) return PROGRESSION_TITLES[3];
    if (level >= 5) return PROGRESSION_TITLES[2];
    if (level >= 3) return PROGRESSION_TITLES[1];
    return PROGRESSION_TITLES[0];
}

/**
 * Get the next title and XP needed to reach it.
 */
export function getNextTitle(level: number, currentXP: number): { title: ProgressionTitle; xpNeeded: number } | null {
    const currentIndex = PROGRESSION_TITLES.findIndex((t) => {
        const [min] = t.level.replace('+', '-999').split('-').map(Number);
        return level < min;
    });

    if (currentIndex === -1) return null; // Already max
    const next = PROGRESSION_TITLES[currentIndex];
    return { title: next, xpNeeded: next.xpRequired - currentXP };
}
