import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type TabItem = {
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    label: string;
};

const TABS: TabItem[] = [
    { icon: 'lock-closed-outline', activeIcon: 'lock-closed', label: 'Lock' },
    { icon: 'home-outline', activeIcon: 'home', label: 'Home' },
    { icon: 'grid-outline', activeIcon: 'grid', label: 'Stats' },
    { icon: 'person-outline', activeIcon: 'person', label: 'Profile' },
];

type Props = {
    activeTab?: number;
    onTabPress?: (index: number) => void;
};

export default function BottomBar({ activeTab = 1, onTabPress }: Props) {
    const [selectedTab, setSelectedTab] = useState(activeTab);

    const handlePress = (index: number) => {
        setSelectedTab(index);
        onTabPress?.(index);
    };

    return (
        <View
            style={{
                position: 'absolute',
                bottom: 28,
                left: 30,
                right: 30,
                backgroundColor: '#252525',
                borderRadius: 40,
                height: 68,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                paddingHorizontal: 8,
                borderWidth: 1,
                borderColor: '#333',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 16,
            }}>
            {TABS.map((tab, index) => {
                const isActive = selectedTab === index;
                return (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.7}
                        onPress={() => handlePress(index)}
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 70,
                            height: 50,
                            borderRadius: 25,
                            ...(isActive ? { backgroundColor: '#F47B20' } : {}),
                        }}>
                        <Ionicons
                            name={isActive ? tab.activeIcon : tab.icon}
                            size={isActive ? 22 : 24}
                            color={isActive ? '#fff' : '#666'}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
