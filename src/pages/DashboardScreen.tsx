import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getTitleForLevel, getNextTitle } from '../constants/progression';
import TerritoryMap from '../components/Map/TerritoryMap';
import { fetchProfile, fetchRunHistory } from '../services/SocialService';
import RunCard from '../components/RunCard';
import RunDetailModal from '../components/RunDetailModal';


const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [territoryCount, setTerritoryCount] = useState(0);
    const [territoryArea, setTerritoryArea] = useState(0);
    const [runs, setRuns] = useState<any[]>([]);
    const [selectedRun, setSelectedRun] = useState<any>(null);
    const [showRunDetail, setShowRunDetail] = useState(false);
    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            if (!user) return;

            // 1. Fetch Profile & Runs
            const [profileData, runsData] = await Promise.all([
                fetchProfile(),
                fetchRunHistory(5)
            ]);
            setProfile(profileData);
            setRuns(runsData);


            // 2. Fetch Territory Stats
            const { count, error } = await supabase
                .from('territory_cells')
                .select('*', { count: 'exact', head: true })
                .eq('owner_id', user.id);

            if (!error && count !== null) {
                setTerritoryCount(count);
                // Approx area based on cell count (each cell ~0.103 km2 at res 9)
                setTerritoryArea(count * 0.103);
            }

        } catch (error) {
            console.error('Dashboard load error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const title = profile ? getTitleForLevel(profile.level || 1) : { title: 'Rookie' };
    const next = profile ? getNextTitle(profile.level || 1, profile.xp || 0) : null;
    const progress = next ? (profile?.xp / next.title.xpRequired) : 0;



    const handleRunPress = (run: any) => {
        setSelectedRun({
            distanceKm: run.distance_km || 0,
            durationMs: run.duration_ms || 0,
            avgPace: run.avg_pace || 0,
            calories: run.calories_burned || 0,
            startedAt: run.started_at,
        });
        setShowRunDetail(true);
    };

    return (

        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top']}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.primary} />}
            >
                {/* Header */}
                <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={{ color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold', fontFamily: 'Inter-Bold' }}>
                                Command Center
                            </Text>
                            <Text style={{ color: COLORS.primary, fontSize: 12, fontFamily: 'SpaceMono-Regular', marginTop: 4 }}>
                                Season 1: Genesis • 24d 3h remaining
                            </Text>
                        </View>

                        {/* XP Pill */}
                        <View style={{ alignItems: 'flex-end' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceLight, padding: 6, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border }}>
                                <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular', marginRight: 8 }}>
                                    Lv {profile?.level || 1} • {profile?.xp || 0} XP
                                </Text>
                            </View>
                            {/* Simple Progress Bar */}
                            <View style={{ width: 100, height: 4, backgroundColor: '#333', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                                <View style={{ width: `${Math.min((progress || 0) * 100, 100)}%`, height: '100%', backgroundColor: COLORS.primary }} />
                            </View>
                            <Text style={{ color: '#666', fontSize: 10, marginTop: 2 }}>
                                {next ? `${next.xpNeeded} to Lv${parseInt(next.title.level.split('-')[0]) || profile?.level + 1}` : 'Max Level'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8 }}>
                    {/* Territories */}
                    <StatCard
                        title="Territories Held"
                        value={territoryCount.toString()}
                        subValue={`${territoryArea.toFixed(2)} km²`}
                        icon="location-outline" // Map pin
                        iconColor={COLORS.primary} // Green
                        delay={0}
                    />

                    {/* Total Distance */}
                    <StatCard
                        title="Total Distance"
                        value={profile?.total_distance_km?.toFixed(1) || '0.0'}
                        subValue="km run"
                        icon="navigate-outline" // Triangle
                        iconColor={COLORS.blue} // Cyan
                        delay={100}
                    />

                    {/* Current Title */}
                    <StatCard
                        title="Current Title"
                        value={title.title}
                        subValue={next ? `Next: ${next.title.title}` : 'Max Title'}
                        icon="ribbon-outline" // Badge
                        iconColor={COLORS.orange} // Orange/Brown
                        delay={200}
                    />

                    {/* Calories */}
                    <StatCard
                        title="Total Calories"
                        value={profile?.total_calories_burned?.toLocaleString() || '0'}
                        subValue="kcal burned"
                        icon="flame-outline" // Fire
                        iconColor={COLORS.orange}
                        delay={300}
                    />
                </View>

                {/* Territory Map Section */}
                <View style={{ marginTop: 16 }}>
                    <View style={{ paddingHorizontal: 16, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' }}>
                            Territory Map
                        </Text>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginRight: 6 }} />
                            <Text style={{ color: '#fff', fontSize: 12 }}>LIVE</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 350, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border }}>
                        <TerritoryMap />
                        {/* Overlay Controls if any needed */}
                    </View>
                </View>

                {/* Recent Runs */}
                <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
                    <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                        Recent Operations
                    </Text>
                    {runs.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingVertical: 20, backgroundColor: COLORS.surfaceLight, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border }}>
                            <Ionicons name="walk-outline" size={32} color="#555" />
                            <Text style={{ color: '#888', fontSize: 14, marginTop: 8 }}>No recent activity</Text>
                        </View>
                    ) : (
                        runs.map((run: any) => (
                            <RunCard
                                key={run.id}
                                distanceKm={run.distance_km || 0}
                                durationMs={run.duration_ms || 0}
                                areaKm2={run.area_captured_km2 || 0}
                                avgPace={run.avg_pace || 0}
                                cellsCaptured={(run.cells_captured || []).length}
                                xpEarned={run.xp_earned || 0}
                                startedAt={run.started_at}
                                onPress={() => handleRunPress(run)}
                            />
                        ))
                    )}
                </View>

                <RunDetailModal
                    visible={showRunDetail}
                    onClose={() => setShowRunDetail(false)}
                    run={selectedRun}
                />
            </ScrollView>

        </SafeAreaView>
    );
}

function StatCard({ title, value, subValue, icon, iconColor, delay }: any) {
    return (
        <View style={{ width: '50%', padding: 8 }}>
            <View style={{
                backgroundColor: COLORS.surfaceLight,
                borderRadius: 12,
                padding: 16,
                minHeight: 140,
                justifyContent: 'space-between',
                borderWidth: 1,
                borderColor: COLORS.border,
            }}>
                <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 12
                }}>
                    <Ionicons name={icon} size={18} color={iconColor} />
                </View>

                <View>
                    <Text style={{ color: ((iconColor === COLORS.primary) ? COLORS.primary : '#fff'), fontSize: 24, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular' }}>
                        {value}
                    </Text>
                    <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                        {title}
                    </Text>
                    <Text style={{ color: '#555', fontSize: 10, marginTop: 2 }}>
                        {subValue}
                    </Text>
                </View>
            </View>
        </View>
    );
}
