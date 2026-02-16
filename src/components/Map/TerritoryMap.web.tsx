import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../../constants/theme';

type Props = {
    onLocationReady?: (lat: number, lng: number) => void;
};

export default function TerritoryMap({ onLocationReady }: Props) {
    return (
        <View style={{ flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: COLORS.primary, fontSize: 24, fontWeight: 'bold' }}>Map Not Available on Web</Text>
            <Text style={{ color: '#888', marginTop: 12 }}>Run on iOS/Android Simulator to see map</Text>
        </View>
    );
}
