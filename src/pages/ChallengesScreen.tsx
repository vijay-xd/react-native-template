import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Alert,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
    ChallengeDefinition,
    RARITY_COLORS,
    RARITY_BG,
} from '../constants/challenges';
import {
    ChallengeProgress,
    fetchChallengeProgress,
    buildChallengeState,
    claimChallengeReward,
    UserChallengeState,
} from '../services/ChallengeService';

const NEON = '#84cc16';

type Tab = 'daily' | 'weekly' | 'achievements';

export default function ChallengesScreen() {
    const [activeTab, setActiveTab] = useState<Tab>('daily');
    const [challengeState, setChallengeState] = useState<UserChallengeState | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadChallenges = useCallback(async () => {
        const progress = await fetchChallengeProgress();
        const state = buildChallengeState(progress);
        setChallengeState(state);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadChallenges();
    }, [loadChallenges]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadChallenges();
        setRefreshing(false);
    };

    const handleClaim = async (challengeId: string, xpReward: number) => {
        const success = await claimChallengeReward(challengeId, xpReward);
        if (success) {
            Alert.alert('🎉 Reward Claimed!', `+${xpReward} XP added to your profile`);
            loadChallenges(); // Refresh
        } else {
            Alert.alert('Note', 'Rewards will sync when connected.');
        }
    };

    const getChallenges = () => {
        if (!challengeState) return [];
        switch (activeTab) {
            case 'daily': return challengeState.dailies;
            case 'weekly': return challengeState.weeklies;
            case 'achievements': return challengeState.achievements;
        }
    };

    const getCompletedCount = () => {
        const challenges = getChallenges();
        return challenges.filter(c => c.completed).length;
    };

    const getTotalXP = () => {
        const challenges = getChallenges();
        return challenges.filter(c => c.completed).reduce((sum, c) => sum + c.xpReward, 0);
    };

    // Calculate time remaining for daily/weekly
    const getTimeRemaining = () => {
        const now = new Date();
        if (activeTab === 'daily') {
            const endOfDay = new Date(now);
            endOfDay.setHours(23, 59, 59, 999);
            const diff = endOfDay.getTime() - now.getTime();
            const hours = Math.floor(diff / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            return `${hours}h ${mins}m`;
        } else if (activeTab === 'weekly') {
            const endOfWeek = new Date(now);
            const daysUntilSunday = 7 - now.getDay();
            endOfWeek.setDate(now.getDate() + daysUntilSunday);
            endOfWeek.setHours(23, 59, 59, 999);
            const diff = endOfWeek.getTime() - now.getTime();
            const days = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            return `${days}d ${hours}h`;
        }
        return '';
    };

    const challenges = getChallenges();

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                {/* Header */}
                <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
                    <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', fontFamily: 'Inter-Bold' }}>
                        Challenges
                    </Text>
                    <Text style={{ color: '#666', fontSize: 13, fontFamily: 'Inter-Regular', marginTop: 4 }}>
                        Complete challenges to earn XP and unlock achievements
                    </Text>
                </View>

                {/* Tab Bar */}
                <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 }}>
                    {(['daily', 'weekly', 'achievements'] as Tab[]).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            activeOpacity={0.7}
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                borderRadius: 12,
                                backgroundColor: activeTab === tab ? NEON : '#111',
                                borderWidth: 1,
                                borderColor: activeTab === tab ? NEON : '#222',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ fontSize: 14, marginBottom: 2 }}>
                                {tab === 'daily' ? '📅' : tab === 'weekly' ? '🗓️' : '🏆'}
                            </Text>
                            <Text
                                style={{
                                    color: activeTab === tab ? '#000' : '#888',
                                    fontSize: 12,
                                    fontWeight: '800',
                                    fontFamily: 'Inter-Bold',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Summary Bar */}
                <View
                    style={{
                        flexDirection: 'row',
                        marginHorizontal: 16,
                        marginBottom: 16,
                        backgroundColor: '#111',
                        borderRadius: 12,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: '#222',
                    }}
                >
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={{ color: NEON, fontSize: 20, fontWeight: '900', fontFamily: 'SpaceMono-Regular' }}>
                            {getCompletedCount()}/{challenges.length}
                        </Text>
                        <Text style={{ color: '#666', fontSize: 10, fontFamily: 'Inter-Regular' }}>COMPLETED</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: '#222' }} />
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={{ color: '#f59e0b', fontSize: 20, fontWeight: '900', fontFamily: 'SpaceMono-Regular' }}>
                            {getTotalXP()}
                        </Text>
                        <Text style={{ color: '#666', fontSize: 10, fontFamily: 'Inter-Regular' }}>XP EARNED</Text>
                    </View>
                    {activeTab !== 'achievements' && (
                        <>
                            <View style={{ width: 1, backgroundColor: '#222' }} />
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <Text style={{ color: '#ef4444', fontSize: 20, fontWeight: '900', fontFamily: 'SpaceMono-Regular' }}>
                                    {getTimeRemaining()}
                                </Text>
                                <Text style={{ color: '#666', fontSize: 10, fontFamily: 'Inter-Regular' }}>REMAINING</Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Challenge List */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NEON} />
                    }
                >
                    {loading ? (
                        <View style={{ paddingTop: 60, alignItems: 'center' }}>
                            <Text style={{ color: '#555', fontSize: 14, fontFamily: 'Inter-Regular' }}>
                                Loading challenges...
                            </Text>
                        </View>
                    ) : (
                        challenges.map((challenge, index) => (
                            <ChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                index={index}
                                onClaim={() => handleClaim(challenge.id, challenge.xpReward)}
                            />
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

// ─── Challenge Card ───

function ChallengeCard({
    challenge,
    index,
    onClaim,
}: {
    challenge: ChallengeDefinition & ChallengeProgress;
    index: number;
    onClaim: () => void;
}) {
    const color = RARITY_COLORS[challenge.rarity];
    const bgColor = RARITY_BG[challenge.rarity];
    const progress = Math.min(challenge.currentValue / challenge.target, 1);
    const isComplete = challenge.completed;
    const isClaimed = challenge.claimed;

    // For pace challenges, progress is inverted (lower is better)
    const displayProgress = challenge.category === 'pace'
        ? (challenge.currentValue > 0 ? Math.min(challenge.target / challenge.currentValue, 1) : 0)
        : progress;

    const displayValue = challenge.category === 'pace'
        ? (challenge.currentValue > 0 ? `${challenge.currentValue.toFixed(1)} ${challenge.unit}` : `-- ${challenge.unit}`)
        : `${Math.min(challenge.currentValue, challenge.target)}/${challenge.target} ${challenge.unit}`;

    return (
        <View
            style={{
                backgroundColor: isComplete ? `${color}08` : '#0a0a0a',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isComplete ? `${color}40` : '#1a1a1a',
                opacity: isClaimed ? 0.5 : 1,
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Icon */}
                <View
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: bgColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 14,
                        borderWidth: 1,
                        borderColor: `${color}30`,
                    }}
                >
                    <Text style={{ fontSize: 22 }}>
                        {isComplete ? '✅' : challenge.icon}
                    </Text>
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <Text
                            style={{
                                color: isComplete ? color : '#fff',
                                fontSize: 15,
                                fontWeight: '700',
                                fontFamily: 'Inter-Bold',
                                flex: 1,
                            }}
                            numberOfLines={1}
                        >
                            {challenge.title}
                        </Text>
                        <View
                            style={{
                                backgroundColor: `${color}15`,
                                borderRadius: 6,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                            }}
                        >
                            <Text
                                style={{
                                    color,
                                    fontSize: 9,
                                    fontWeight: '800',
                                    fontFamily: 'SpaceMono-Regular',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {challenge.rarity}
                            </Text>
                        </View>
                    </View>

                    <Text
                        style={{
                            color: '#666',
                            fontSize: 12,
                            fontFamily: 'Inter-Regular',
                            marginBottom: 8,
                        }}
                        numberOfLines={1}
                    >
                        {challenge.description}
                    </Text>

                    {/* Progress bar */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View
                            style={{
                                flex: 1,
                                height: 6,
                                backgroundColor: '#1a1a1a',
                                borderRadius: 3,
                                overflow: 'hidden',
                            }}
                        >
                            <View
                                style={{
                                    width: `${displayProgress * 100}%`,
                                    height: '100%',
                                    backgroundColor: isComplete ? color : '#444',
                                    borderRadius: 3,
                                }}
                            />
                        </View>
                        <Text
                            style={{
                                color: isComplete ? color : '#555',
                                fontSize: 10,
                                fontFamily: 'SpaceMono-Regular',
                                fontWeight: '700',
                                minWidth: 80,
                                textAlign: 'right',
                            }}
                        >
                            {displayValue}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Reward / Claim */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: '#1a1a1a',
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 12 }}>⭐</Text>
                    <Text style={{ color: '#f59e0b', fontSize: 13, fontWeight: '700', fontFamily: 'SpaceMono-Regular' }}>
                        {challenge.xpReward} XP
                    </Text>
                </View>

                {isComplete && !isClaimed ? (
                    <TouchableOpacity
                        onPress={onClaim}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: color,
                            borderRadius: 8,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                        }}
                    >
                        <Text style={{ color: '#000', fontSize: 12, fontWeight: '800', fontFamily: 'Inter-Bold' }}>
                            CLAIM
                        </Text>
                    </TouchableOpacity>
                ) : isClaimed ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="checkmark-circle" size={16} color="#555" />
                        <Text style={{ color: '#555', fontSize: 11, fontFamily: 'Inter-Regular' }}>
                            Claimed
                        </Text>
                    </View>
                ) : (
                    <Text style={{ color: '#333', fontSize: 11, fontFamily: 'SpaceMono-Regular' }}>
                        {Math.round(displayProgress * 100)}%
                    </Text>
                )}
            </View>
        </View>
    );
}
