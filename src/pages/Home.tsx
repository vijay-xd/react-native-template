import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../constants/theme';
import DistanceCard from '../components/DistanceCard';
import StatsRow from '../components/StatsRow';
import CaloriesCard from '../components/CaloriesCard';
import BottomBar from '../components/BottomBar';

type Props = {
    runnerImage: ImageSourcePropType;
    onOpenChallenges?: () => void;
};

export default function Home({ runnerImage, onOpenChallenges }: Props) {
    return (
        <View style={{ flex: 1, backgroundColor: COLORS.surfaceLight }}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
                    {/* Header */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: 10,
                            marginBottom: 24,
                        }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text
                                style={{ color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>
                                Runnit.
                            </Text>
                            <Ionicons
                                name="walk"
                                size={24}
                                color={COLORS.orange}
                                style={{ marginLeft: 6 }}
                            />
                        </View>
                        <TouchableOpacity
                            style={{
                                width: 46,
                                height: 46,
                                borderRadius: 23,
                                backgroundColor: '#252525',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            activeOpacity={0.7}>
                            <Ionicons name="notifications" size={20} color={COLORS.orange} />
                        </TouchableOpacity>
                    </View>

                    {/* Greeting */}
                    <Text style={{ color: '#8e8e8e', fontSize: 16, marginBottom: 6 }}>
                        Good work for today, Jennie 🔥
                    </Text>

                    {/* Main Title */}
                    <Text
                        style={{
                            color: '#fff',
                            fontSize: 34,
                            fontWeight: '800',
                            lineHeight: 42,
                            letterSpacing: -0.5,
                            marginBottom: 26,
                        }}>
                        Run Your Way to{'\n'}Better Health
                    </Text>

                    {/* Distance Card */}
                    <DistanceCard runnerImage={runnerImage} />

                    {/* Stats Row */}
                    <StatsRow />

                    {/* Calories Card */}
                    <CaloriesCard />

                    {/* Challenges Quick Access */}
                    {onOpenChallenges && (
                        <TouchableOpacity
                            onPress={onOpenChallenges}
                            activeOpacity={0.85}
                            style={{
                                marginTop: 16,
                                backgroundColor: '#111',
                                borderRadius: 16,
                                padding: 18,
                                borderWidth: 1,
                                borderColor: '#222',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <View
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    backgroundColor: 'rgba(132,204,22,0.1)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 14,
                                }}
                            >
                                <Text style={{ fontSize: 22 }}>🏆</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                                    Daily Challenges
                                </Text>
                                <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                                    Complete tasks to earn XP & rewards
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#555" />
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* Floating Bottom Bar */}
            <BottomBar />
        </View>
    );
}
