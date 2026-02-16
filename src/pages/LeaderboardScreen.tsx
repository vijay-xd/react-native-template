import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchLeaderboard, LeaderboardScope } from '../services/SocialService';
import { useAuth } from '../context/AuthContext';
import { getTitleForLevel } from '../constants/progression';

const NEON = '#84cc16';

const SCOPES: { key: LeaderboardScope; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'nearby', label: 'Nearby', icon: 'location-outline' },
    { key: 'city', label: 'City', icon: 'business-outline' },
    { key: 'global', label: 'Global', icon: 'globe-outline' },
];

export default function LeaderboardScreen() {
    const { user } = useAuth();
    const [activeScope, setActiveScope] = useState<LeaderboardScope>('city');
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        const data = await fetchLeaderboard(activeScope, { city: 'Chennai' });
        setLeaders(data);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        setLoading(true);
        loadData();
    }, [activeScope]);

    const getMedalIcon = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return null;
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={NEON} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={NEON} />}
                >
                    {/* Header */}
                    <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', fontFamily: 'Inter-Bold', marginTop: 8, marginBottom: 4 }}>
                        Leaderboard
                    </Text>
                    <Text style={{ color: '#666', fontSize: 14, fontFamily: 'Inter-Regular', marginBottom: 20 }}>
                        Who dominates the streets?
                    </Text>

                    {/* Scope Tabs */}
                    <View style={{ flexDirection: 'row', marginBottom: 20, gap: 8 }}>
                        {SCOPES.map((scope) => (
                            <TouchableOpacity
                                key={scope.key}
                                onPress={() => setActiveScope(scope.key)}
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    paddingVertical: 10,
                                    borderRadius: 10,
                                    backgroundColor: activeScope === scope.key ? NEON : '#1A1A1A',
                                    borderWidth: 1,
                                    borderColor: activeScope === scope.key ? NEON : '#333',
                                }}
                            >
                                <Ionicons
                                    name={scope.icon}
                                    size={14}
                                    color={activeScope === scope.key ? '#000' : '#888'}
                                />
                                <Text
                                    style={{
                                        color: activeScope === scope.key ? '#000' : '#888',
                                        fontSize: 12,
                                        fontWeight: '700',
                                        fontFamily: 'Inter-Bold',
                                    }}
                                >
                                    {scope.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Top 3 Podium */}
                    {leaders.length >= 3 && (
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 24, gap: 8 }}>
                            {/* #2 */}
                            <PodiumCard
                                rank={2}
                                username={leaders[1]?.username}
                                level={leaders[1]?.level}
                                xp={leaders[1]?.xp}
                                height={100}
                            />
                            {/* #1 */}
                            <PodiumCard
                                rank={1}
                                username={leaders[0]?.username}
                                level={leaders[0]?.level}
                                xp={leaders[0]?.xp}
                                height={130}
                            />
                            {/* #3 */}
                            <PodiumCard
                                rank={3}
                                username={leaders[2]?.username}
                                level={leaders[2]?.level}
                                xp={leaders[2]?.xp}
                                height={80}
                            />
                        </View>
                    )}

                    {/* Full List */}
                    {leaders.map((entry: any, index: number) => {
                        const rank = index + 1;
                        const medal = getMedalIcon(rank);
                        const isMe = entry.user_id === user?.id;
                        const title = getTitleForLevel(entry.level || 1);

                        return (
                            <View
                                key={entry.user_id || index}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: isMe ? 'rgba(132, 204, 22, 0.08)' : '#111',
                                    borderRadius: 12,
                                    padding: 14,
                                    marginBottom: 6,
                                    borderWidth: 1,
                                    borderColor: isMe ? 'rgba(132, 204, 22, 0.3)' : '#1f1f1f',
                                }}
                            >
                                {/* Rank */}
                                <View style={{ width: 36, alignItems: 'center' }}>
                                    {medal ? (
                                        <Text style={{ fontSize: 20 }}>{medal}</Text>
                                    ) : (
                                        <Text style={{ color: '#666', fontSize: 14, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular' }}>
                                            {rank}
                                        </Text>
                                    )}
                                </View>

                                {/* Avatar */}
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: '#222',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12,
                                        borderWidth: isMe ? 1.5 : 0,
                                        borderColor: NEON,
                                    }}
                                >
                                    <Text style={{ fontSize: 16, color: '#fff' }}>
                                        {entry.username?.charAt(0).toUpperCase() || '?'}
                                    </Text>
                                </View>

                                {/* Info */}
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={{ color: isMe ? NEON : '#fff', fontSize: 14, fontWeight: '700', fontFamily: 'Inter-Bold' }}>
                                            {entry.username || 'Unknown'}
                                        </Text>
                                        {isMe && (
                                            <View style={{ backgroundColor: NEON, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                                                <Text style={{ color: '#000', fontSize: 9, fontWeight: 'bold', fontFamily: 'Inter-Bold' }}>YOU</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={{ color: '#555', fontSize: 11, fontFamily: 'Inter-Regular', marginTop: 2 }}>
                                        Lv.{entry.level || 1} • {title.title}
                                    </Text>
                                </View>

                                {/* XP */}
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ color: NEON, fontSize: 14, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular' }}>
                                        {(entry.xp || 0).toLocaleString()}
                                    </Text>
                                    <Text style={{ color: '#555', fontSize: 9, fontFamily: 'Inter-Regular' }}>XP</Text>
                                </View>
                            </View>
                        );
                    })}

                    {leaders.length === 0 && (
                        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                            <Ionicons name="trophy-outline" size={48} color="#333" />
                            <Text style={{ color: '#555', fontSize: 15, marginTop: 12, fontFamily: 'Inter-Regular' }}>
                                No runners found in this scope
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

function PodiumCard({ rank, username, level, xp, height }: {
    rank: number;
    username?: string;
    level?: number;
    xp?: number;
    height: number;
}) {
    const medals = ['🥇', '🥈', '🥉'];
    const colors = [NEON, '#C0C0C0', '#CD7F32'];

    return (
        <View style={{ alignItems: 'center', flex: 1 }}>
            {/* Avatar */}
            <View
                style={{
                    width: rank === 1 ? 56 : 44,
                    height: rank === 1 ? 56 : 44,
                    borderRadius: rank === 1 ? 28 : 22,
                    backgroundColor: '#222',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: colors[rank - 1],
                    marginBottom: 8,
                }}
            >
                <Text style={{ fontSize: rank === 1 ? 22 : 16, color: '#fff' }}>
                    {username?.charAt(0).toUpperCase() || '?'}
                </Text>
            </View>

            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', fontFamily: 'Inter-Bold', marginBottom: 2 }}>
                {username || 'Unknown'}
            </Text>

            {/* Podium pillar */}
            <View
                style={{
                    width: '100%',
                    height,
                    backgroundColor: '#1A1A1A',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#222',
                    borderBottomWidth: 0,
                }}
            >
                <Text style={{ fontSize: 28 }}>{medals[rank - 1]}</Text>
                <Text style={{ color: NEON, fontSize: 13, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular', marginTop: 4 }}>
                    {(xp || 0).toLocaleString()}
                </Text>
                <Text style={{ color: '#555', fontSize: 9, fontFamily: 'Inter-Regular' }}>XP</Text>
            </View>
        </View>
    );
}
