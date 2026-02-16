import React, { useEffect, useState } from 'react';
import { COLORS } from '../constants/theme';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchLeaderboard, LeaderboardScope } from '../services/SocialService';
import { useAuth } from '../context/AuthContext';
import { getTitleForLevel } from '../constants/progression';
import * as Location from 'expo-location';

const NEON = COLORS.primary;

// Updated Scopes: My Region, City, State, Global
const SCOPES: { key: LeaderboardScope; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'nearby', label: 'My Region', icon: 'location-outline' }, // 50km radius
    { key: 'city', label: 'City', icon: 'business-outline' },
    { key: 'state', label: 'State', icon: 'map-outline' },
    { key: 'global', label: 'Global', icon: 'globe-outline' },
];

export default function LeaderboardScreen() {
    const { user } = useAuth();
    const [activeScope, setActiveScope] = useState<LeaderboardScope>('nearby');
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadData = async () => {
        setErrorMessage(null);
        try {
            let params: any = {};

            if (activeScope === 'nearby') {
                // Request location permissions
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMessage('Permission to access location was denied. Cannot show nearby leaderboard.');
                    setLoading(false);
                    setRefreshing(false);
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                params = {
                    lat: location.coords.latitude,
                    lng: location.coords.longitude,
                };
            } else if (activeScope === 'city') {
                // TODO: Get actual user city from profile or reverse geocoding
                params = { city: 'Chennai' };
            } else if (activeScope === 'state') {
                // TODO: Get actual user state
                params = { state: 'Tamil Nadu' };
            }

            const data = await fetchLeaderboard(activeScope, params);
            setLeaders(data);
        } catch (error: any) {
            console.error('Error loading leaderboard:', error);
            setErrorMessage('Failed to load leaderboard data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
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

    if (loading && !refreshing) {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={NEON} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={NEON} />}
                >
                    {/* Header */}
                    <Text style={{ color: COLORS.textPrimary, fontSize: 28, fontWeight: '900', fontFamily: 'Inter-Bold', marginTop: 8, marginBottom: 4 }}>
                        Leaderboard
                    </Text>
                    <Text style={{ color: '#666', fontSize: 14, fontFamily: 'Inter-Regular', marginBottom: 20 }}>
                        Who dominates the {activeScope === 'nearby' ? 'region (50km)' : activeScope}?
                    </Text>

                    {/* Scope Tabs */}
                    <View style={{ flexDirection: 'row', marginBottom: 20, gap: 8 }}>
                        {SCOPES.map((scope) => (
                            <TouchableOpacity
                                key={scope.key}
                                onPress={() => setActiveScope(scope.key)}
                                style={{
                                    flex: 1,
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 4,
                                    paddingVertical: 10,
                                    borderRadius: 10,
                                    backgroundColor: activeScope === scope.key ? NEON : COLORS.surfaceLight,
                                    borderWidth: 1,
                                    borderColor: activeScope === scope.key ? NEON : COLORS.border,
                                }}
                            >
                                <Ionicons
                                    name={scope.icon}
                                    size={16}
                                    color={activeScope === scope.key ? '#000' : '#888'}
                                />
                                <Text
                                    style={{
                                        color: activeScope === scope.key ? '#000' : '#888',
                                        fontSize: 10,
                                        fontWeight: '700',
                                        fontFamily: 'Inter-Bold',
                                        textAlign: 'center',
                                    }}
                                >
                                    {scope.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {errorMessage ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: COLORS.red, textAlign: 'center' }}>{errorMessage}</Text>
                            <TouchableOpacity onPress={loadData} style={{ marginTop: 10 }}>
                                <Text style={{ color: NEON, textDecorationLine: 'underline' }}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            {/* Top 3 Podium */}
                            {leaders.length >= 3 && (
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 24, gap: 8 }}>
                                    {/* #2 */}
                                    <PodiumCard
                                        rank={2}
                                        username={leaders[1]?.username}
                                        level={leaders[1]?.level}
                                        value={activeScope === 'nearby' ? leaders[1]?.total_distance_km : leaders[1]?.xp}
                                        label={activeScope === 'nearby' ? 'km' : 'XP'}
                                        height={100}
                                    />
                                    {/* #1 */}
                                    <PodiumCard
                                        rank={1}
                                        username={leaders[0]?.username}
                                        level={leaders[0]?.level}
                                        value={activeScope === 'nearby' ? leaders[0]?.total_distance_km : leaders[0]?.xp}
                                        label={activeScope === 'nearby' ? 'km' : 'XP'}
                                        height={130}
                                    />
                                    {/* #3 */}
                                    <PodiumCard
                                        rank={3}
                                        username={leaders[2]?.username}
                                        level={leaders[2]?.level}
                                        value={activeScope === 'nearby' ? leaders[2]?.total_distance_km : leaders[2]?.xp}
                                        label={activeScope === 'nearby' ? 'km' : 'XP'}
                                        height={80}
                                    />
                                </View>
                            )}

                            {/* Full List */}
                            {leaders.map((entry: any, index: number) => {
                                const rank = index + 1;
                                const medal = getMedalIcon(rank);
                                const isMe = entry.username === user?.user_metadata?.username; // Fallback check if user_id missing in list
                                const title = getTitleForLevel(entry.level || 1);
                                const displayValue = activeScope === 'nearby'
                                    ? `${Number(entry.total_distance_km || 0).toFixed(1)} km`
                                    : `${(entry.xp || 0).toLocaleString()} XP`;

                                return (
                                    <View
                                        key={entry.user_id || index}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: isMe ? COLORS.primaryAlpha(0.08) : COLORS.elevated,
                                            borderRadius: 12,
                                            padding: 14,
                                            marginBottom: 6,
                                            borderWidth: 1,
                                            borderColor: isMe ? COLORS.primaryAlpha(0.3) : COLORS.border,
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
                                                <Text style={{ color: isMe ? NEON : COLORS.textPrimary, fontSize: 14, fontWeight: '700', fontFamily: 'Inter-Bold' }}>
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

                                        {/* Value (XP or Distance) */}
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={{ color: NEON, fontSize: 14, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular' }}>
                                                {displayValue}
                                            </Text>
                                            <Text style={{ color: '#555', fontSize: 9, fontFamily: 'Inter-Regular' }}>
                                                {activeScope === 'nearby' ? 'DISTANCE' : 'TOTAL XP'}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </>
                    )}

                    {leaders.length === 0 && !loading && !errorMessage && (
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

function PodiumCard({ rank, username, level, value, label, height }: {
    rank: number;
    username?: string;
    level?: number;
    value?: number;
    label: string;
    height: number;
}) {
    const medals = ['🥇', '🥈', '🥉'];
    const colors = [COLORS.primary, '#C0C0C0', '#CD7F32'];

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
                    backgroundColor: COLORS.surfaceLight,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderBottomWidth: 0,
                }}
            >
                <Text style={{ fontSize: 28 }}>{medals[rank - 1]}</Text>
                <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular', marginTop: 4 }}>
                    {label === 'km' ? Number(value || 0).toFixed(1) : (value || 0).toLocaleString()}
                </Text>
                <Text style={{ color: '#555', fontSize: 9, fontFamily: 'Inter-Regular' }}>{label}</Text>
            </View>
        </View>
    );
}
