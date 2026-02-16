import React, { useState, useRef, useEffect } from 'react';
import { COLORS } from '../constants/theme';
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    Easing,
    Vibration,
    Alert,
    Modal,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRunTracker } from '../hooks/useRunTracker';
import { useTerritoryCapture } from '../hooks/useTerritoryCapture';
import { useAuth } from '../context/AuthContext';
import { formatDuration, formatPace, formatDistance } from '../utils/geo';
import { saveRun, updateProfileAfterRun, calculateXP } from '../services/RunService';
import CellCaptureToast from '../components/CellCaptureToast';

const NEON = COLORS.primary;

export default function RunScreen() {
    const { user } = useAuth();
    const {
        runState,
        stats,
        currentLocation,
        startRun,
        pauseRun,
        resumeRun,
        stopRun,
        resetRun,
    } = useRunTracker();

    const {
        territoryStats,
        isCapturing,
        captureQueue,
        onLocationUpdate,
        dismissCapture,
        resetTerritory,
        getCurrentCell,
    } = useTerritoryCapture(user?.id);

    const [showSummary, setShowSummary] = useState(false);
    const [finalStats, setFinalStats] = useState<typeof stats | null>(null);
    const [finalTerritory, setFinalTerritory] = useState<typeof territoryStats | null>(null);
    const [saving, setSaving] = useState(false);

    // Feed GPS updates to territory capture engine
    useEffect(() => {
        if (runState === 'running' && currentLocation) {
            onLocationUpdate(currentLocation.latitude, currentLocation.longitude);
        }
    }, [currentLocation, runState, onLocationUpdate]);

    // Vibrate on cell capture
    useEffect(() => {
        if (captureQueue.length > 0) {
            Vibration.vibrate([0, 80, 50, 80]);
        }
    }, [captureQueue.length]);

    // Pulsing animation for START button
    const pulseAnim = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        if (runState === 'idle') {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.08, duration: 1200,
                        easing: Easing.inOut(Easing.ease), useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1, duration: 1200,
                        easing: Easing.inOut(Easing.ease), useNativeDriver: true,
                    }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
    }, [runState]);

    const handleStart = async () => {
        Vibration.vibrate(50);
        resetTerritory();
        await startRun();
    };

    const handlePause = () => { Vibration.vibrate(30); pauseRun(); };
    const handleResume = () => { Vibration.vibrate(30); resumeRun(); };

    const handleStop = () => {
        Vibration.vibrate([0, 50, 100, 50]);
        const result = stopRun();
        setFinalStats(result);
        setFinalTerritory({ ...territoryStats });
        setShowSummary(true);
    };

    const handleSaveRun = async () => {
        if (!finalStats || !user) return;
        setSaving(true);
        try {
            const cellsCaptured = finalTerritory?.cellsCaptured || [];
            const xp = calculateXP(finalStats.distanceKm, finalStats.averagePace)
                + (cellsCaptured.length * 25); // +25 XP per cell captured

            await saveRun({
                user_id: user.id,
                distance_km: finalStats.distanceKm,
                duration_sec: finalStats.durationSec,
                avg_pace: finalStats.averagePace,
                avg_speed: finalStats.averageSpeed,
                max_speed: finalStats.maxSpeed,
                calories: finalStats.calories,
                route: finalStats.routePoints,
                cells_captured: cellsCaptured,
                started_at: finalStats.startedAt || new Date().toISOString(),
                finished_at: new Date().toISOString(),
                status: 'finished',
            });

            await updateProfileAfterRun(finalStats.distanceKm, xp);

            Alert.alert(
                '🏆 Run Saved!',
                `+${xp} XP earned\n${formatDistance(finalStats.distanceKm)} in ${formatDuration(finalStats.durationSec)}\n⬡ ${cellsCaptured.length} territories captured`
            );
        } catch (err) {
            console.error('Save error:', err);
            Alert.alert('Note', 'Run recorded locally. Sync when connected.');
        }
        setSaving(false);
        setShowSummary(false);
        resetRun();
        resetTerritory();
    };

    const handleDiscard = () => {
        setShowSummary(false);
        setFinalStats(null);
        setFinalTerritory(null);
        resetRun();
        resetTerritory();
    };

    const currentCellId = getCurrentCell();

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            {/* ─── Map / GPS Area ─── */}
            <View
                style={{
                    flex: 1,
                    backgroundColor: '#0a0a0a',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {currentLocation ? (
                    <View style={{ alignItems: 'center' }}>
                        {/* GPS dot */}
                        <View
                            style={{
                                width: 16, height: 16, borderRadius: 8,
                                backgroundColor: NEON,
                                shadowColor: NEON,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.8, shadowRadius: 12,
                            }}
                        />
                        <Text style={{ color: '#555', fontSize: 11, marginTop: 12, fontFamily: 'SpaceMono-Regular' }}>
                            {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
                        </Text>

                        {/* Current H3 cell indicator */}
                        {runState === 'running' && currentCellId && (
                            <View
                                style={{
                                    marginTop: 12,
                                    backgroundColor: 'rgba(132,204,22,0.08)',
                                    borderRadius: 8,
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderWidth: 1,
                                    borderColor: 'rgba(132,204,22,0.2)',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <Text style={{ fontSize: 14 }}>⬡</Text>
                                <Text style={{ color: NEON, fontSize: 11, fontFamily: 'SpaceMono-Regular' }}>
                                    {currentCellId.slice(-8).toUpperCase()}
                                </Text>
                                {isCapturing && (
                                    <Text style={{ color: '#f97316', fontSize: 10 }}>⏳</Text>
                                )}
                            </View>
                        )}

                        {runState === 'running' && (
                            <Text style={{ color: NEON, fontSize: 12, marginTop: 8, fontFamily: 'Inter-Regular' }}>
                                📡 GPS Tracking Active
                            </Text>
                        )}
                    </View>
                ) : (
                    <View style={{ alignItems: 'center' }}>
                        <Ionicons name="location-outline" size={32} color="#333" />
                        <Text style={{ color: '#555', fontSize: 13, marginTop: 8, fontFamily: 'Inter-Regular' }}>
                            Waiting for GPS signal...
                        </Text>
                    </View>
                )}

                {/* Territory mini-stats (top-left) */}
                {runState !== 'idle' && (
                    <View
                        style={{
                            position: 'absolute',
                            top: 60,
                            left: 16,
                            backgroundColor: 'rgba(26,26,26,0.9)',
                            borderRadius: 10,
                            padding: 10,
                            borderWidth: 1,
                            borderColor: '#333',
                            flexDirection: 'row',
                            gap: 12,
                        }}
                    >
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: NEON, fontSize: 16, fontWeight: '900', fontFamily: 'SpaceMono-Regular' }}>
                                ⬡ {territoryStats.cellsCaptured.length}
                            </Text>
                            <Text style={{ color: '#666', fontSize: 9, fontFamily: 'Inter-Regular' }}>
                                CAPTURED
                            </Text>
                        </View>
                        <View style={{ width: 1, backgroundColor: '#333' }} />
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ color: '#888', fontSize: 16, fontWeight: '900', fontFamily: 'SpaceMono-Regular' }}>
                                {territoryStats.totalCellsVisited}
                            </Text>
                            <Text style={{ color: '#666', fontSize: 9, fontFamily: 'Inter-Regular' }}>
                                VISITED
                            </Text>
                        </View>
                    </View>
                )}

                {/* Route point count (top-right) */}
                {stats.routePoints.length > 0 && (
                    <View
                        style={{
                            position: 'absolute',
                            top: 60,
                            right: 16,
                            backgroundColor: 'rgba(26,26,26,0.9)',
                            borderRadius: 8,
                            padding: 8,
                            borderWidth: 1,
                            borderColor: '#333',
                        }}
                    >
                        <Text style={{ color: '#888', fontSize: 10, fontFamily: 'SpaceMono-Regular' }}>
                            {stats.routePoints.length} pts
                        </Text>
                    </View>
                )}
            </View>

            {/* ─── Cell Capture Toast ─── */}
            {captureQueue.length > 0 && (
                <CellCaptureToast
                    cellId={captureQueue[0].cellId}
                    isNew={captureQueue[0].isNew}
                    wasStolen={captureQueue[0].wasStolen}
                    cellCount={territoryStats.cellsCaptured.length}
                    onDismiss={dismissCapture}
                />
            )}

            {/* ─── Live Stats Panel ─── */}
            {(runState === 'running' || runState === 'paused') && (
                <View
                    style={{
                        position: 'absolute',
                        top: 110,
                        left: 16,
                        right: 16,
                        backgroundColor: 'rgba(0,0,0,0.88)',
                        borderRadius: 16,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: '#222',
                    }}
                >
                    {/* Main stat: Distance */}
                    <View style={{ alignItems: 'center', marginBottom: 16 }}>
                        <Text style={{ color: NEON, fontSize: 48, fontWeight: '900', fontFamily: 'SpaceMono-Regular' }}>
                            {stats.distanceKm.toFixed(2)}
                        </Text>
                        <Text style={{ color: '#666', fontSize: 13, fontFamily: 'Inter-Regular', marginTop: -4 }}>
                            KILOMETERS
                        </Text>
                    </View>

                    {/* Secondary stats row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <StatBox label="TIME" value={formatDuration(stats.durationSec)} color="#fff" />
                        <StatBox label="PACE" value={formatPace(stats.currentPace)}
                            color={stats.currentPace > 0 && stats.currentPace < 6 ? NEON : '#fff'} />
                        <StatBox label="SPEED" value={`${stats.currentSpeed.toFixed(1)}`} unit="km/h" color="#fff" />
                        <StatBox label="CAL" value={`${Math.round(stats.calories)}`} color="#f97316" />
                    </View>

                    {/* Paused indicator */}
                    {runState === 'paused' && (
                        <View style={{
                            marginTop: 12,
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: 8, padding: 8,
                            alignItems: 'center',
                        }}>
                            <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular' }}>
                                ⏸ PAUSED
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* ─── Bottom Controls ─── */}
            <View
                style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    paddingBottom: 100,
                    alignItems: 'center',
                }}
            >
                {runState === 'idle' ? (
                    <View style={{ alignItems: 'center' }}>
                        {/* Action buttons */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 280, marginBottom: 20 }}>
                            <TouchableOpacity activeOpacity={0.7} style={miniButtonStyle}>
                                <Ionicons name="settings-outline" size={22} color="#ccc" />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.7} style={miniButtonStyle}>
                                <Ionicons name="musical-notes-outline" size={22} color="#ccc" />
                            </TouchableOpacity>
                        </View>

                        {/* START button */}
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <TouchableOpacity onPress={handleStart} activeOpacity={0.85} style={startButtonStyle}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Ionicons name="play" size={28} color="#000" />
                                    <Text style={{ color: '#000', fontSize: 22, fontWeight: '900', fontFamily: 'Inter-Bold', letterSpacing: 1 }}>
                                        START
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>

                        <TouchableOpacity style={{ marginTop: 14 }}>
                            <Text style={{ color: '#888', fontSize: 14, fontFamily: 'Inter-Regular', textDecorationLine: 'underline' }}>
                                Set a Goal
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : runState !== 'finished' ? (
                    <View style={{ alignItems: 'center', gap: 16 }}>
                        {/* Mini timer */}
                        <View style={{
                            backgroundColor: 'rgba(26,26,26,0.95)',
                            borderRadius: 12,
                            paddingHorizontal: 20, paddingVertical: 10,
                            borderWidth: 1, borderColor: '#333',
                        }}>
                            <Text style={{ color: NEON, fontSize: 18, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular', textAlign: 'center' }}>
                                {formatDuration(stats.durationSec)}
                            </Text>
                        </View>

                        {/* Control buttons */}
                        <View style={{ flexDirection: 'row', gap: 24 }}>
                            {runState === 'running' ? (
                                <>
                                    <TouchableOpacity onPress={handlePause} activeOpacity={0.85} style={pauseButtonStyle}>
                                        <Ionicons name="pause" size={32} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleStop} activeOpacity={0.85} style={stopButtonStyle}>
                                        <Ionicons name="stop" size={32} color="#fff" />
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity onPress={handleResume} activeOpacity={0.85}
                                        style={{ ...pauseButtonStyle, backgroundColor: NEON, borderColor: NEON }}>
                                        <Ionicons name="play" size={32} color="#000" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleStop} activeOpacity={0.85} style={stopButtonStyle}>
                                        <Ionicons name="stop" size={32} color="#fff" />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                ) : null}
            </View>

            {/* ─── Run Summary Modal ─── */}
            <Modal visible={showSummary} animationType="slide" transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' }}>
                    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 40 }}>
                        <View style={{ alignItems: 'center', marginBottom: 32 }}>
                            <Text style={{ fontSize: 48, marginBottom: 8 }}>🏃</Text>
                            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', fontFamily: 'Inter-Bold' }}>
                                Run Complete!
                            </Text>
                            <Text style={{ color: '#888', fontSize: 14, fontFamily: 'Inter-Regular', marginTop: 4 }}>
                                {finalStats?.startedAt
                                    ? new Date(finalStats.startedAt).toLocaleDateString('en-US', {
                                        weekday: 'long', month: 'short', day: 'numeric',
                                    })
                                    : ''}
                            </Text>
                        </View>

                        {/* Big distance */}
                        <View style={{ alignItems: 'center', marginBottom: 28 }}>
                            <Text style={{ color: NEON, fontSize: 56, fontWeight: '900', fontFamily: 'SpaceMono-Regular' }}>
                                {(finalStats?.distanceKm || 0).toFixed(2)}
                            </Text>
                            <Text style={{ color: '#666', fontSize: 14, fontFamily: 'Inter-Regular', marginTop: -4 }}>
                                KILOMETERS
                            </Text>
                        </View>

                        {/* Stats grid */}
                        <View style={{
                            backgroundColor: '#111', borderRadius: 16, padding: 20,
                            marginBottom: 16, borderWidth: 1, borderColor: '#222',
                        }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
                                <SummaryItem icon="⏱" label="Duration" value={formatDuration(finalStats?.durationSec || 0)} />
                                <SummaryItem icon="🏎️" label="Avg Pace" value={formatPace(finalStats?.averagePace || 0)} />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
                                <SummaryItem icon="💨" label="Avg Speed" value={`${(finalStats?.averageSpeed || 0).toFixed(1)} km/h`} />
                                <SummaryItem icon="⚡" label="Max Speed" value={`${(finalStats?.maxSpeed || 0).toFixed(1)} km/h`} />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <SummaryItem icon="🔥" label="Calories" value={`${Math.round(finalStats?.calories || 0)} kcal`} />
                                <SummaryItem icon="⛰️" label="Elevation" value={`${Math.round(finalStats?.elevationGain || 0)}m`} />
                            </View>
                        </View>

                        {/* Territory capture summary */}
                        <View style={{
                            backgroundColor: '#111', borderRadius: 16, padding: 20,
                            marginBottom: 16, borderWidth: 1, borderColor: NEON + '30',
                        }}>
                            <Text style={{ color: NEON, fontSize: 14, fontWeight: '800', fontFamily: 'Inter-Bold', marginBottom: 16, textAlign: 'center', letterSpacing: 1 }}>
                                ⬡ TERRITORY REPORT
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <SummaryItem
                                    icon="🏴"
                                    label="Cells Captured"
                                    value={`${finalTerritory?.cellsCaptured.length || 0}`}
                                />
                                <SummaryItem
                                    icon="👁️"
                                    label="Cells Visited"
                                    value={`${finalTerritory?.totalCellsVisited || 0}`}
                                />
                                <SummaryItem
                                    icon="⚔️"
                                    label="Stolen"
                                    value={`${finalTerritory?.stolenCellsThisRun || 0}`}
                                />
                            </View>
                        </View>

                        {/* XP earned */}
                        <View style={{
                            backgroundColor: 'rgba(132, 204, 22, 0.08)',
                            borderRadius: 12, padding: 16, marginBottom: 28,
                            borderWidth: 1, borderColor: 'rgba(132, 204, 22, 0.2)',
                            alignItems: 'center',
                        }}>
                            <Text style={{ color: NEON, fontSize: 22, fontWeight: '900', fontFamily: 'SpaceMono-Regular' }}>
                                +{calculateXP(finalStats?.distanceKm || 0, finalStats?.averagePace || 0)
                                    + ((finalTerritory?.cellsCaptured.length || 0) * 25)} XP
                            </Text>
                            <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 4 }}>
                                Run XP + Territory Bonus ({(finalTerritory?.cellsCaptured.length || 0) * 25} XP)
                            </Text>
                        </View>

                        {/* Action buttons */}
                        <TouchableOpacity onPress={handleSaveRun} disabled={saving}
                            style={{
                                backgroundColor: NEON, borderRadius: 12, padding: 16,
                                alignItems: 'center', marginBottom: 12, opacity: saving ? 0.5 : 1,
                            }}>
                            <Text style={{ color: '#000', fontSize: 16, fontWeight: '800', fontFamily: 'Inter-Bold' }}>
                                {saving ? '⏳ Saving...' : '💾 Save Run'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleDiscard}
                            style={{
                                borderRadius: 12, padding: 14, alignItems: 'center',
                                borderWidth: 1, borderColor: '#333',
                            }}>
                            <Text style={{ color: '#888', fontSize: 14, fontFamily: 'Inter-Regular' }}>
                                Discard Run
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

// ─── Styles ───

const miniButtonStyle = {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderWidth: 1, borderColor: '#333',
    alignItems: 'center' as const, justifyContent: 'center' as const,
};

const startButtonStyle = {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: NEON,
    alignItems: 'center' as const, justifyContent: 'center' as const,
    shadowColor: NEON,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 24, elevation: 15,
};

const pauseButtonStyle = {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2, borderColor: '#fff',
    alignItems: 'center' as const, justifyContent: 'center' as const,
};

const stopButtonStyle = {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#ef4444',
    alignItems: 'center' as const, justifyContent: 'center' as const,
};

// ─── Sub-Components ───

function StatBox({ label, value, unit, color }: {
    label: string; value: string; unit?: string; color: string;
}) {
    return (
        <View style={{ alignItems: 'center' }}>
            <Text style={{ color, fontSize: 20, fontFamily: 'SpaceMono-Regular', fontWeight: 'bold' }}>
                {value}
            </Text>
            {unit && <Text style={{ color: '#555', fontSize: 9, fontFamily: 'Inter-Regular', marginTop: -2 }}>{unit}</Text>}
            <Text style={{ color: '#666', fontSize: 10, fontFamily: 'Inter-Regular', marginTop: 2 }}>{label}</Text>
        </View>
    );
}

function SummaryItem({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <View style={{ alignItems: 'center', minWidth: 100 }}>
            <Text style={{ fontSize: 20, marginBottom: 4 }}>{icon}</Text>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'SpaceMono-Regular' }}>{value}</Text>
            <Text style={{ color: '#666', fontSize: 11, fontFamily: 'Inter-Regular', marginTop: 2 }}>{label}</Text>
        </View>
    );
}
