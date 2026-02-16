import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { RARITY_COLORS } from '../constants/challenges';

// ─────────────────────────────────────────────
// AchievementToast — Animated Achievement Unlock
// Premium celebration notification with glow + scale
// ─────────────────────────────────────────────

const TOAST_DURATION = 3500;

interface Props {
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xpReward: number;
    onDismiss: () => void;
}

export default function AchievementToast({
    title,
    description,
    icon,
    rarity,
    xpReward,
    onDismiss,
}: Props) {
    const slideAnim = useRef(new Animated.Value(-120)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.6)).current;
    const iconScaleAnim = useRef(new Animated.Value(0)).current;
    const shineAnim = useRef(new Animated.Value(0)).current;

    const color = RARITY_COLORS[rarity] || '#a0a0a0';

    useEffect(() => {
        // Entrance
        Animated.sequence([
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 60,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 6,
                    useNativeDriver: true,
                }),
            ]),
            // Icon bounce
            Animated.spring(iconScaleAnim, {
                toValue: 1,
                tension: 150,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();

        // Shine loop
        const shine = Animated.loop(
            Animated.sequence([
                Animated.timing(shineAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(shineAnim, {
                    toValue: 0,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        shine.start();

        // Auto-dismiss
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -120,
                    duration: 400,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                shine.stop();
                onDismiss();
            });
        }, TOAST_DURATION);

        return () => {
            clearTimeout(timer);
            shine.stop();
        };
    }, []);

    const rarityLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1);

    return (
        <Animated.View
            style={{
                position: 'absolute',
                top: 60,
                left: 16,
                right: 16,
                zIndex: 1000,
                transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim },
                ],
                opacity: opacityAnim,
            }}
        >
            <View
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    borderRadius: 20,
                    padding: 20,
                    borderWidth: 2,
                    borderColor: color,
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 24,
                    elevation: 15,
                }}
            >
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: 12 }}>
                    <Text
                        style={{
                            color: color,
                            fontSize: 11,
                            fontWeight: '900',
                            letterSpacing: 3,
                            fontFamily: 'Inter-Bold',
                        }}
                    >
                        🏆 ACHIEVEMENT UNLOCKED
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Icon */}
                    <Animated.View
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 16,
                            backgroundColor: `${color}15`,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 14,
                            borderWidth: 1.5,
                            borderColor: `${color}50`,
                            transform: [{ scale: iconScaleAnim }],
                            opacity: shineAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1],
                            }),
                        }}
                    >
                        <Text style={{ fontSize: 28 }}>{icon}</Text>
                    </Animated.View>

                    {/* Text */}
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                color: '#fff',
                                fontSize: 16,
                                fontWeight: '800',
                                fontFamily: 'Inter-Bold',
                            }}
                        >
                            {title}
                        </Text>
                        <Text
                            style={{
                                color: '#888',
                                fontSize: 12,
                                fontFamily: 'Inter-Regular',
                                marginTop: 2,
                            }}
                        >
                            {description}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                            <Text
                                style={{
                                    color: color,
                                    fontSize: 11,
                                    fontWeight: '700',
                                    fontFamily: 'SpaceMono-Regular',
                                }}
                            >
                                {rarityLabel}
                            </Text>
                            <Text style={{ color: '#333' }}>•</Text>
                            <Text
                                style={{
                                    color: '#84cc16',
                                    fontSize: 12,
                                    fontWeight: '800',
                                    fontFamily: 'SpaceMono-Regular',
                                }}
                            >
                                +{xpReward} XP
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}
