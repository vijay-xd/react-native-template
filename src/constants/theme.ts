// ─────────────────────────────────────────────
// CENTRALIZED THEME — Change colors here only!
// All app files import from this single source.
// ─────────────────────────────────────────────

// ─── PRIMARY BRAND COLORS ───
export const COLORS = {
    // Primary green — buttons, active states, accents, progress bars
    primary: '#84cc16',

    // Neon glow — shadows, glows, light effects
    neonGlow: '#80ff00',

    // Primary with alpha — for backgrounds & borders
    primaryAlpha: (opacity: number) => `rgba(132, 204, 22, ${opacity})`,

    // ─── ACCENT COLORS ───
    orange: '#8fd22bff',       // Distance card, fire icon, notification bell
    gold: '#f59e0b',         // XP rewards, legendary rarity, gold medals
    red: '#ef4444',          // Enemy cells, errors, danger, exit buttons
    green: '#22c55e',        // Online status, open rooms, success
    blue: '#3b82f6',         // Rare rarity, info elements
    purple: '#a855f7',       // Epic rarity
    pink: '#ec4899',         // Crew color option
    teal: '#14b8a6',         // Crew color option
    yellow: '#eab308',       // Crew color option

    // ─── NEUTRAL / SURFACE COLORS ───
    background: '#000000',   // App background
    surface: '#111111',      // Cards, panels
    surfaceLight: '#1a1a1a', // Slightly lighter cards, Home bg
    border: '#222222',       // Card borders
    borderLight: '#1f1f1f',  // Subtle borders
    elevated: '#252525',     // Elevated elements (notification button, etc)

    // ─── TEXT COLORS ───
    textPrimary: '#ffffff',
    textSecondary: '#888888',
    textMuted: '#666666',
    textDim: '#555555',
    textGhost: '#333333',    // Very dim text, separators

    // ─── SPECIAL ───
    overlay: 'rgba(0, 0, 0, 0.85)',     // Modals, overlays
    overlayDark: 'rgba(0, 0, 0, 0.95)',  // Achievement toasts
    transparent: 'transparent',
} as const;

// ─── CREW COLOR PALETTE ───
export const CREW_COLORS = [
    COLORS.primary,   // '#84cc16'
    COLORS.red,       // '#ef4444'
    COLORS.blue,      // '#3b82f6'
    '#f97316',        // Orange
    '#8b5cf6',        // Violet
    COLORS.pink,      // '#ec4899'
    COLORS.teal,      // '#14b8a6'
    COLORS.yellow,    // '#eab308'
];

// ─── RARITY COLORS ───
export const RARITY_COLORS: Record<string, string> = {
    common: '#a0a0a0',
    rare: COLORS.blue,
    epic: COLORS.purple,
    legendary: COLORS.gold,
};

export const RARITY_BG: Record<string, string> = {
    common: 'rgba(160, 160, 160, 0.08)',
    rare: 'rgba(59, 130, 246, 0.08)',
    epic: 'rgba(168, 85, 247, 0.08)',
    legendary: 'rgba(245, 158, 11, 0.08)',
};

// ─── TERRITORY MAP COLORS ───
export const MAP_COLORS = {
    ownCell: COLORS.primary,
    enemyCell: COLORS.red,
    contested: COLORS.gold,
};

// ─── TYPOGRAPHY ───
export const FONTS = {
    regular: 'Inter-Regular',
    bold: 'Inter-Bold',
    mono: 'SpaceMono-Regular',
};

// ─── SPACING / SIZING ───
export const SIZES = {
    bottomBarHeight: 72,
    bottomBarPadding: 20,
    cardRadius: 16,
    buttonRadius: 12,
    badgeRadius: 8,
};
