import React from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
    visible: boolean;
    onClose: () => void;
    run: {
        distanceKm: number;
        durationMs: number;
        avgPace: number;
        calories?: number;
        startedAt: string;
    } | null;
};

function formatPace(pace: number): string {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}'${String(seconds).padStart(2, '0')}"`;
}

function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    }).toUpperCase();
}

export default function RunDetailModal({ visible, onClose, run }: Props) {
    if (!run) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: '#000',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 32,
                }}
            >
                {/* Close button */}
                <TouchableOpacity
                    onPress={onClose}
                    activeOpacity={0.7}
                    style={{
                        position: 'absolute',
                        top: 60,
                        right: 24,
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: '#222',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>

                {/* RUN DETAILS header */}
                <Text
                    style={{
                        color: '#F47B20',
                        fontSize: 13,
                        fontWeight: 'bold',
                        letterSpacing: 3,
                        fontFamily: 'SpaceMono-Regular',
                        marginBottom: 24,
                    }}
                >
                    RUN DETAILS
                </Text>

                {/* Large distance number */}
                <Text
                    style={{
                        color: '#fff',
                        fontSize: 80,
                        fontWeight: '900',
                        fontFamily: 'Inter-Bold',
                        letterSpacing: -2,
                    }}
                >
                    {run.distanceKm.toFixed(2)}
                </Text>
                <Text
                    style={{
                        color: '#888',
                        fontSize: 14,
                        letterSpacing: 4,
                        fontFamily: 'SpaceMono-Regular',
                        marginBottom: 40,
                    }}
                >
                    KILOMETERS
                </Text>

                {/* Pace & Time */}
                <View style={{ flexDirection: 'row', gap: 48, marginBottom: 24 }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text
                            style={{
                                color: '#fff',
                                fontSize: 32,
                                fontWeight: '700',
                                fontStyle: 'italic',
                                fontFamily: 'Inter-Bold',
                            }}
                        >
                            {formatPace(run.avgPace)} /km
                        </Text>
                        <Text
                            style={{
                                color: '#888',
                                fontSize: 12,
                                letterSpacing: 2,
                                fontFamily: 'SpaceMono-Regular',
                                marginTop: 4,
                            }}
                        >
                            AVG PACE
                        </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text
                            style={{
                                color: '#fff',
                                fontSize: 32,
                                fontWeight: '700',
                                fontStyle: 'italic',
                                fontFamily: 'Inter-Bold',
                            }}
                        >
                            {formatDuration(run.durationMs)}
                        </Text>
                        <Text
                            style={{
                                color: '#888',
                                fontSize: 12,
                                letterSpacing: 2,
                                fontFamily: 'SpaceMono-Regular',
                                marginTop: 4,
                            }}
                        >
                            TIME
                        </Text>
                    </View>
                </View>

                {/* Map placeholder */}
                <Text
                    style={{
                        color: '#555',
                        fontSize: 13,
                        fontFamily: 'Inter-Regular',
                        letterSpacing: 2,
                        marginBottom: 48,
                    }}
                >
                    MAP DISABLED
                </Text>

                {/* Calories */}
                {run.calories !== undefined && run.calories > 0 && (
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#1A1A1A',
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 20,
                            gap: 8,
                            marginBottom: 32,
                        }}
                    >
                        <Text style={{ fontSize: 18 }}>🔥</Text>
                        <Text
                            style={{
                                color: '#F47B20',
                                fontSize: 15,
                                fontWeight: 'bold',
                                fontFamily: 'SpaceMono-Regular',
                            }}
                        >
                            {run.calories} kcal
                        </Text>
                    </View>
                )}

                {/* Runnit branding */}
                <Text
                    style={{
                        color: '#fff',
                        fontSize: 28,
                        fontWeight: '900',
                        fontFamily: 'Inter-Bold',
                        letterSpacing: 2,
                    }}
                >
                    RUNNIT
                </Text>
                <View
                    style={{
                        width: 40,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: '#F47B20',
                        marginTop: 8,
                        marginBottom: 12,
                    }}
                />
                <Text
                    style={{
                        color: '#888',
                        fontSize: 11,
                        letterSpacing: 2,
                        fontFamily: 'SpaceMono-Regular',
                    }}
                >
                    {formatDate(run.startedAt)}
                </Text>
            </View>
        </Modal>
    );
}
