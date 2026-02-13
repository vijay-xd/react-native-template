import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';

type Props = {
    runnerImage: ImageSourcePropType;
};

export default function DistanceCard({ runnerImage }: Props) {
    return (
        <View
            style={{
                backgroundColor: '#F47B20',
                borderRadius: 24,
                overflow: 'hidden',
                minHeight: 210,
                position: 'relative',
            }}>
            {/* Runner Image — positioned on the right */}
            <Image
                source={runnerImage}
                style={{
                    position: 'absolute',
                    right: -15,
                    top: -5,
                    width: 200,
                    height: 230,
                    opacity: 0.9,
                }}
                resizeMode="contain"
            />

            {/* Content overlay */}
            <View style={{ padding: 22, zIndex: 10 }}>
                {/* Title Row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: 'rgba(255,255,255,0.25)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 10,
                        }}>
                        <Text style={{ fontSize: 16 }}>🏃</Text>
                    </View>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Your Distance</Text>
                </View>

                {/* Distance Value */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 52, fontWeight: '800', lineHeight: 56 }}>
                        10.24
                    </Text>
                    <Text
                        style={{
                            color: '#fff',
                            fontSize: 18,
                            fontWeight: '500',
                            marginLeft: 4,
                            marginBottom: 6,
                        }}>
                        km
                    </Text>
                </View>

                {/* Increase Badge */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>Increase 5.4%</Text>
                    <View
                        style={{
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 8,
                        }}>
                        <Text style={{ color: '#fff', fontSize: 12 }}>⬆</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
