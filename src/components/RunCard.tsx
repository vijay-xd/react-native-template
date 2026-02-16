import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type RunCardProps = {
    distanceKm: number;
    durationMs: number;
    areaKm2: number;
    avgPace: number; // min/km
    cellsCaptured: number;
    xpEarned: number;
    startedAt: string;
    onPress?: () => void;
};

function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return '1d ago';
    return `${days}d ago`;
}

function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function RunCard({
    distanceKm,
    durationMs,
    areaKm2,
    avgPace,
    cellsCaptured,
    xpEarned,
    startedAt,
    onPress,
}: RunCardProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{
                backgroundColor: '#111',
                borderRadius: 12,
                padding: 16,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: '#1f1f1f',
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Left side: Run info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    {/* Lightning icon */}
                    <View
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: 'rgba(132, 204, 22, 0.15)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                        }}
                    >
                        <Ionicons name="flash" size={18} color="#84cc16" />
                    </View>

                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: 'Inter-Bold' }}>
                                {distanceKm.toFixed(2)} km Run
                            </Text>

                            {/* Badges */}
                            {cellsCaptured > 0 && (
                                <View
                                    style={{
                                        backgroundColor: 'rgba(132, 204, 22, 0.2)',
                                        borderRadius: 4,
                                        paddingHorizontal: 6,
                                        paddingVertical: 2,
                                    }}
                                >
                                    <Text style={{ color: '#84cc16', fontSize: 10, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular' }}>
                                        {cellsCaptured} CELLS
                                    </Text>
                                </View>
                            )}

                            {xpEarned > 0 && (
                                <View
                                    style={{
                                        backgroundColor: 'rgba(132, 204, 22, 0.1)',
                                        borderRadius: 4,
                                        paddingHorizontal: 6,
                                        paddingVertical: 2,
                                    }}
                                >
                                    <Text style={{ color: '#84cc16', fontSize: 10, fontFamily: 'SpaceMono-Regular' }}>
                                        +{xpEarned.toLocaleString()} XP
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Text style={{ color: '#666', fontSize: 12, marginTop: 3, fontFamily: 'Inter-Regular' }}>
                            {formatTimeAgo(startedAt)}, {formatTime(startedAt)}
                        </Text>
                    </View>
                </View>

                {/* Right side: Stats */}
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'SpaceMono-Regular', fontWeight: 'bold' }}>
                            {distanceKm.toFixed(2)}
                        </Text>
                        <Text style={{ color: '#666', fontSize: 9, fontFamily: 'Inter-Regular' }}>
                            km
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'SpaceMono-Regular', fontWeight: 'bold' }}>
                            {formatDuration(durationMs)}
                        </Text>
                        <Text style={{ color: '#666', fontSize: 9, fontFamily: 'Inter-Regular', textTransform: 'uppercase' }}>
                            duration
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'SpaceMono-Regular', fontWeight: 'bold' }}>
                            {areaKm2.toFixed(2)}
                        </Text>
                        <Text style={{ color: '#666', fontSize: 9, fontFamily: 'Inter-Regular' }}>
                            km²
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'SpaceMono-Regular', fontWeight: 'bold' }}>
                            {avgPace.toFixed(1)}
                        </Text>
                        <Text style={{ color: '#666', fontSize: 9, fontFamily: 'Inter-Regular', textTransform: 'uppercase' }}>
                            min/km
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
