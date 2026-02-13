import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DistanceCard from '../components/DistanceCard';
import StatsRow from '../components/StatsRow';
import CaloriesCard from '../components/CaloriesCard';

const runnerImage = require('../../assets/runner.png');

export default function Home() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36 }}>
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
                        <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>
                            PacePro.
                        </Text>
                        <Text style={{ fontSize: 24, marginLeft: 6 }}>🏃</Text>
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
                        <Text style={{ fontSize: 20 }}>🔔</Text>
                    </TouchableOpacity>
                </View>

                {/* Greeting */}
                <Text style={{ color: '#8e8e8e', fontSize: 16, marginBottom: 6 }}>
                    Good work for today, Jennie🔥
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
            </ScrollView>
        </SafeAreaView>
    );
}
