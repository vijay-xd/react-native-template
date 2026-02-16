import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

// ─────────────────────────────────────────────
// CellCaptureToast — Animated Territory Capture Notification
// Slides in from top, pulses, then auto-dismisses
// ─────────────────────────────────────────────

const NEON = '#84cc16';
const TOAST_DURATION = 2500; // Auto-dismiss after 2.5s

interface Props {
    cellId: string;
    isNew?: boolean;
    wasStolen?: boolean;
    cellCount: number;      // Total cells captured this run
    onDismiss: () => void;
}

export default function CellCaptureToast({
    cellId,
    isNew = true,
    wasStolen = false,
    cellCount,
    onDismiss,
}: Props) {
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 80,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 120,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Glow pulse
        const glow = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 600,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.3,
                    duration: 600,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        glow.start();

        // Auto-dismiss
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -100,
                    duration: 300,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                glow.stop();
                onDismiss();
            });
        }, TOAST_DURATION);

        return () => {
            clearTimeout(timer);
            glow.stop();
        };
    }, []);

    const emoji = wasStolen ? '⚔️' : '🏴';
    const title = wasStolen ? 'TERRITORY STOLEN!' : 'TERRITORY CAPTURED!';
    const color = wasStolen ? '#ef4444' : NEON;
    const shortId = cellId.slice(-6).toUpperCase();

    return (
        <Animated.View
            style={{
                position: 'absolute',
                top: 120,
                left: 16,
                right: 16,
                zIndex: 999,
                transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim },
                ],
                opacity: opacityAnim,
            }}
        >
            <View
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.92)',
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: color,
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 16,
                    elevation: 10,
                }}
            >
                {/* Hex icon */}
                <Animated.View
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: `${color}15`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                        borderWidth: 1,
                        borderColor: `${color}40`,
                        opacity: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.7, 1],
                        }),
                    }}
                >
                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </Animated.View>

                {/* Text content */}
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            color: color,
                            fontSize: 13,
                            fontWeight: '900',
                            fontFamily: 'Inter-Bold',
                            letterSpacing: 1.2,
                        }}
                    >
                        {title}
                    </Text>
                    <Text
                        style={{
                            color: '#888',
                            fontSize: 11,
                            fontFamily: 'SpaceMono-Regular',
                            marginTop: 2,
                        }}
                    >
                        Cell #{shortId}
                    </Text>
                </View>

                {/* Cell counter badge */}
                <View
                    style={{
                        backgroundColor: `${color}20`,
                        borderRadius: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderWidth: 1,
                        borderColor: `${color}40`,
                    }}
                >
                    <Text
                        style={{
                            color: color,
                            fontSize: 14,
                            fontWeight: '900',
                            fontFamily: 'SpaceMono-Regular',
                        }}
                    >
                        ⬡ {cellCount}
                    </Text>
                </View>
            </View>
        </Animated.View>
    );
}
