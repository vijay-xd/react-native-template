import React, { useEffect, useState } from 'react';
import { COLORS } from '../constants/theme';
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
import { useAuth } from '../context/AuthContext';
import { fetchProfile, updateProfile, fetchUserAchievements } from '../services/SocialService';
import EditProfileModal from '../components/EditProfileModal';
import { ACHIEVEMENTS, Achievement } from '../constants/achievements';

import { getTitleForLevel, getNextTitle, RUNNER_TRAITS } from '../constants/progression';


const NEON = COLORS.primary;

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const [profile, setProfile] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);



    const loadData = async () => {
        if (!user) return;

        const [profileData, achievementsData] = await Promise.all([
            fetchProfile(),
            fetchUserAchievements(user.id),
        ]);
        setProfile(profileData);

        setUnlockedAchievements(achievementsData);

        setLoading(false);
        setRefreshing(false);
    };


    useEffect(() => {
        loadData();
    }, []);



    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={NEON} />
            </View>
        );
    }

    const currentTitle = getTitleForLevel(profile?.level || 1);
    const nextTitle = getNextTitle(profile?.level || 1, profile?.xp || 0);
    const xpProgress = nextTitle
        ? ((profile?.xp || 0) - currentTitle.xpRequired) / (nextTitle.title.xpRequired - currentTitle.xpRequired)
        : 1;

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={NEON} />}
                >
                    {/* Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 20 }}>
                        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', fontFamily: 'Inter-Bold' }}>
                            Profile
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setEditModalVisible(true)}
                                style={{
                                    paddingHorizontal: 14,
                                    paddingVertical: 8,
                                    borderRadius: 8,
                                    backgroundColor: '#222',
                                    borderWidth: 1,
                                    borderColor: '#333',
                                }}
                            >
                                <Ionicons name="create-outline" size={16} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={signOut}
                                style={{
                                    paddingHorizontal: 14,
                                    paddingVertical: 8,
                                    borderRadius: 8,
                                    backgroundColor: '#1A1A1A',
                                    borderWidth: 1,
                                    borderColor: '#333',
                                }}
                            >
                                <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: 'bold', fontFamily: 'Inter-Bold' }}>
                                    Sign Out
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Profile Card */}
                    <View
                        style={{
                            backgroundColor: '#111',
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: '#1f1f1f',
                        }}
                    >
                        {/* Avatar + Name */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            <View
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 32,
                                    backgroundColor: '#222',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 2,
                                    borderColor: NEON,
                                    marginRight: 16,
                                }}
                            >
                                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff' }}>
                                    {profile?.username?.charAt(0).toUpperCase() || '?'}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', fontFamily: 'Inter-Bold' }}>
                                    {profile?.display_name || profile?.username || 'Runner'}
                                </Text>
                                <Text style={{ color: '#888', fontSize: 13, fontFamily: 'Inter-Regular' }}>
                                    @{profile?.username || 'unknown'}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                    <Text style={{ color: NEON, fontSize: 12, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular' }}>
                                        Lv.{profile?.level || 1}
                                    </Text>
                                    <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Inter-Regular' }}>
                                        {currentTitle.title}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* XP Progress Bar */}
                        <View style={{ marginBottom: 16 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ color: '#888', fontSize: 11, fontFamily: 'SpaceMono-Regular' }}>
                                    {(profile?.xp || 0).toLocaleString()} XP
                                </Text>
                                {nextTitle && (
                                    <Text style={{ color: '#555', fontSize: 11, fontFamily: 'SpaceMono-Regular' }}>
                                        {nextTitle.title.xpRequired.toLocaleString()} XP
                                    </Text>
                                )}
                            </View>
                            <View style={{ height: 6, backgroundColor: '#222', borderRadius: 3 }}>
                                <View
                                    style={{
                                        height: 6,
                                        backgroundColor: NEON,
                                        borderRadius: 3,
                                        width: `${Math.min(Math.max(xpProgress * 100, 0), 100)}%`,
                                    }}
                                />
                            </View>
                            {nextTitle && (
                                <Text style={{ color: '#555', fontSize: 10, fontFamily: 'Inter-Regular', marginTop: 4 }}>
                                    {nextTitle.xpNeeded.toLocaleString()} XP to {nextTitle.title.title}
                                </Text>
                            )}
                        </View>

                        {/* Stats Grid */}
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <StatBox label="DISTANCE" value={`${(profile?.total_distance_km || 0).toFixed(1)}`} unit="km" />
                            <StatBox label="AREA" value={`${(profile?.total_area_km2 || 0).toFixed(2)}`} unit="km²" />
                            <StatBox label="FRIENDS" value={`${profile?.friend_count || 0}`} />
                            <StatBox label="LEVEL" value={`${profile?.level || 1}`} accent />
                        </View>
                    </View>

                    {/* Achievements */}
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', fontFamily: 'Inter-Bold', marginBottom: 12 }}>
                        🏆 Achievements
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                        {ACHIEVEMENTS.map((achievement) => {
                            const unlocked = unlockedAchievements.includes(achievement.id);
                            return (
                                <View
                                    key={achievement.id}
                                    style={{
                                        marginRight: 10,
                                        width: 140,
                                        height: 140,
                                        backgroundColor: '#111',
                                        borderRadius: 12,
                                        padding: 12,
                                        borderWidth: 1,
                                        borderColor: unlocked ? NEON : '#333',
                                        opacity: unlocked ? 1 : 0.5,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <achievement.icon size={32} color={unlocked ? NEON : '#555'} strokeWidth={1.5} />
                                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', fontFamily: 'Inter-Bold', marginTop: 12, textAlign: 'center' }}>
                                        {achievement.title}
                                    </Text>
                                    <Text style={{ color: '#888', fontSize: 10, fontFamily: 'Inter-Regular', marginTop: 4, textAlign: 'center' }}>
                                        {achievement.description}
                                    </Text>
                                </View>
                            );
                        })}

                    </ScrollView>

                    {/* Runner Traits */}
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', fontFamily: 'Inter-Bold', marginBottom: 12 }}>
                        ⚡ Runner Traits
                    </Text>
                    <View style={{ marginBottom: 20 }}>
                        {RUNNER_TRAITS.map((trait) => (
                            <View
                                key={trait.trait}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: '#111',
                                    borderRadius: 12,
                                    padding: 14,
                                    marginBottom: 6,
                                    borderWidth: 1,
                                    borderColor: '#1f1f1f',
                                }}
                            >
                                <Text style={{ fontSize: 24, marginRight: 12 }}>{trait.icon}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700', fontFamily: 'Inter-Bold' }}>
                                        {trait.trait}
                                    </Text>
                                    <Text style={{ color: '#555', fontSize: 11, fontFamily: 'Inter-Regular', marginTop: 2 }}>
                                        {trait.unlockCondition}
                                    </Text>
                                </View>
                                <Text style={{ color: NEON, fontSize: 11, fontFamily: 'SpaceMono-Regular', textAlign: 'right', maxWidth: 120 }}>
                                    {trait.effect}
                                </Text>
                            </View>
                        ))}
                    </View>


                </ScrollView>
            </SafeAreaView>



            <EditProfileModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                onSave={loadData}
                initialData={profile}
            />
        </View>
    );
}

function StatBox({ label, value, unit, accent }: { label: string; value: string; unit?: string; accent?: boolean }) {
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#1A1A1A',
                borderRadius: 10,
                padding: 12,
                alignItems: 'center',
            }}
        >
            <Text
                style={{
                    color: accent ? NEON : '#fff',
                    fontSize: 20,
                    fontWeight: 'bold',
                    fontFamily: 'SpaceMono-Regular',
                }}
            >
                {value}
            </Text>
            {unit && (
                <Text style={{ color: '#666', fontSize: 10, fontFamily: 'Inter-Regular' }}>{unit}</Text>
            )}
            <Text style={{ color: '#555', fontSize: 9, fontFamily: 'Inter-Regular', marginTop: 4, textTransform: 'uppercase' }}>
                {label}
            </Text>
        </View>
    );
}
