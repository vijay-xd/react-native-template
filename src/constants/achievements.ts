import { LucideIcon, Trophy, Zap, Flame, Crown, Shield, Building2, Star, Gem } from 'lucide-react-native';

export type Achievement = {
    id: string;
    title: string;
    description: string;
    icon: any; // Lucide icon
    category: 'run' | 'territory' | 'social' | 'progression';
    xpReward: number;
    condition?: (stats: any) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_blood',
        title: 'First Blood',
        description: 'Completed first run',
        icon: Trophy,
        category: 'run',
        xpReward: 100,
        condition: (stats) => stats.total_runs >= 1,
    },
    {
        id: 'territory_taker',
        title: 'Territory Taker',
        description: 'Conquered first zone',
        icon: Zap,
        category: 'territory',
        xpReward: 200,
        condition: (stats) => stats.territory_cells >= 1,
    },
    {
        id: 'streak_7',
        title: '7-Day Streak',
        description: 'Ran 7 days in a row',
        icon: Flame,
        category: 'run',
        xpReward: 500,
        // Condition handled by streak logic
    },
    {
        id: 'street_king',
        title: 'Street King',
        description: 'Hold a territory for 24h',
        icon: Crown,
        category: 'territory',
        xpReward: 1000,
    },
    {
        id: 'zone_ruler',
        title: 'Zone Ruler',
        description: 'Defend territory 3 times',
        icon: Shield,
        category: 'territory',
        xpReward: 300,
    },
    {
        id: 'city_dominator',
        title: 'City Dominator',
        description: 'Own 5 localities',
        icon: Building2,
        category: 'territory',
        xpReward: 2500,
        condition: (stats) => stats.territories_count >= 5, // Assuming localities mapping
    },
    {
        id: 'marathon_master',
        title: 'Marathon Master',
        description: 'Run 42.2 km total',
        icon: Star,
        category: 'run',
        xpReward: 1000,
        condition: (stats) => stats.total_distance_km >= 42.2,
    },
    {
        id: 'diamond_runner',
        title: 'Diamond Runner',
        description: 'Reach 50,000 XP',
        icon: Gem,
        category: 'progression',
        xpReward: 5000,
        condition: (stats) => stats.xp >= 50000,
    },
];
