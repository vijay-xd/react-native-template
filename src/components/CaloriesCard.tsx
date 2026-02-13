import React from 'react';
import { View, Text } from 'react-native';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Each day has two bars (left = orange, right = brown), with height percentages
const BAR_DATA = [
    { left: 35, right: 50, isHighlight: false },
    { left: 30, right: 40, isHighlight: false },
    { left: 100, right: 45, isHighlight: true },
    { left: 30, right: 50, isHighlight: false },
    { left: 40, right: 60, isHighlight: false },
    { left: 35, right: 50, isHighlight: false },
    { left: 38, right: 55, isHighlight: false },
];

const MAX_BAR_HEIGHT = 120;

export default function CaloriesCard() {
    return (
        <View
            style={{
                backgroundColor: '#252525',
                borderRadius: 22,
                paddingHorizontal: 22,
                paddingTop: 22,
                paddingBottom: 18,
                marginTop: 18,
            }}>
            {/* Header */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 28,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: '#3a2210',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 10,
                        }}>
                        <Text style={{ fontSize: 16 }}>🔥</Text>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Calories Burnt</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                    <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
                        580
                    </Text>
                    <Text style={{ color: '#666', fontSize: 13, marginLeft: 3, marginBottom: 3 }}>kcal</Text>
                </View>
            </View>

            {/* Bar Chart */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    height: MAX_BAR_HEIGHT,
                }}>
                {BAR_DATA.map((bar, index) => {
                    const leftH = (bar.left / 100) * MAX_BAR_HEIGHT;
                    const rightH = (bar.right / 100) * MAX_BAR_HEIGHT;
                    return (
                        <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'flex-end',
                                    gap: 3,
                                }}>
                                {/* Left bar (orange) */}
                                <View
                                    style={{
                                        width: 14,
                                        height: leftH,
                                        borderRadius: 5,
                                        backgroundColor: bar.isHighlight ? '#F47B20' : '#F47B20',
                                    }}
                                />
                                {/* Right bar (brown) */}
                                <View
                                    style={{
                                        width: 14,
                                        height: rightH,
                                        borderRadius: 5,
                                        backgroundColor: '#5C3316',
                                    }}
                                />
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Day Labels */}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 14,
                }}>
                {DAYS.map((day, index) => (
                    <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={{ color: '#555', fontSize: 12, fontWeight: '500' }}>{day}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
