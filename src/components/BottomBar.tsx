import React from 'react';
import { View, TouchableOpacity, Dimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

type TabItem = {
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    label: string;
};

const TABS: TabItem[] = [
    { icon: 'home-outline', activeIcon: 'home', label: 'Home' },
    { icon: 'map-outline', activeIcon: 'map', label: 'Map' },
    { icon: 'walk-outline', activeIcon: 'walk', label: 'Run' },
    { icon: 'people-outline', activeIcon: 'people', label: 'Social' },
    { icon: 'person-outline', activeIcon: 'person', label: 'Profile' },
];

const BAR_HEIGHT = SIZES.bottomBarHeight;
const NEON = COLORS.primary;

type Props = {
    activeTab?: number;
    onTabPress?: (index: number) => void;
};

export default function BottomBar({ activeTab = 0, onTabPress }: Props) {
    return (
        <View
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: BAR_HEIGHT + 20, // extra for safe area
                paddingBottom: 20,
                backgroundColor: '#111111',
                borderTopWidth: 1,
                borderTopColor: '#222',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 8,
            }}
        >
            {TABS.map((tab, index) => {
                const isActive = activeTab === index;
                const isRunTab = index === 2; // Center "Run" tab gets special treatment

                return (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.7}
                        onPress={() => onTabPress?.(index)}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: BAR_HEIGHT,
                            paddingTop: 8,
                        }}
                    >
                        {isRunTab ? (
                            /* Special center "Run" button */
                            <View
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    backgroundColor: isActive ? NEON : '#1A1A1A',
                                    borderWidth: isActive ? 0 : 1.5,
                                    borderColor: NEON,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginTop: -8,
                                    shadowColor: isActive ? NEON : 'transparent',
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 12,
                                    elevation: isActive ? 8 : 0,
                                }}
                            >
                                <Ionicons
                                    name={isActive ? tab.activeIcon : tab.icon}
                                    size={24}
                                    color={isActive ? '#000' : NEON}
                                />
                            </View>
                        ) : (
                            <Ionicons
                                name={isActive ? tab.activeIcon : tab.icon}
                                size={24}
                                color={isActive ? NEON : '#666'}
                            />
                        )}
                        <Text
                            style={{
                                color: isActive ? NEON : '#666',
                                fontSize: 10,
                                marginTop: 4,
                                fontFamily: 'Inter-Regular',
                            }}
                        >
                            {tab.label}
                        </Text>
                        {isActive && !isRunTab && (
                            <View
                                style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: NEON,
                                    marginTop: 3,
                                }}
                            />
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}