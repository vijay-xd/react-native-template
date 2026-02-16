import { View, Text, Image, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

type Props = {
    runnerImage: ImageSourcePropType;
};

export default function DistanceCard({ runnerImage }: Props) {
    return (
        <View
            style={{
                backgroundColor: COLORS.orange,
                borderRadius: 22,
                overflow: 'hidden',
                minHeight: 210,
                position: 'relative',
            }}>
            {/* Runner Image */}
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

            {/* Content */}
            <View style={{ padding: 22, zIndex: 10 }}>
                {/* Title Row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 19,
                            backgroundColor: 'rgba(255,255,255,0.22)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 10,
                        }}>
                        <Ionicons name="footsteps" size={18} color="#fff" />
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
                        <Ionicons name="arrow-up" size={12} color="#fff" />
                    </View>
                </View>
            </View>
        </View>
    );
}
