import { View, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function StatsRow() {
    return (
        <View style={{ flexDirection: 'row', gap: 14, marginTop: 18 }}>
            {/* Daily Steps Card */}
            <View
                style={{
                    flex: 1,
                    backgroundColor: COLORS.elevated,
                    borderRadius: 22,
                    paddingHorizontal: 18,
                    paddingVertical: 20,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: '#162d45',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 10,
                        }}>
                        <MaterialCommunityIcons name="shoe-sneaker" size={18} color={COLORS.blue} />
                    </View>
                    <Text style={{ color: '#8e8e8e', fontSize: 14, fontWeight: '500' }}>Daily Steps</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                    <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
                        8.451
                    </Text>
                    <Text style={{ color: '#666', fontSize: 13, marginLeft: 4, marginBottom: 3 }}>
                        steps
                    </Text>
                </View>
            </View>

            {/* Heart Rate Card */}
            <View
                style={{
                    flex: 1,
                    backgroundColor: COLORS.elevated,
                    borderRadius: 22,
                    paddingHorizontal: 18,
                    paddingVertical: 20,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: '#1a3a1a',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 10,
                        }}>
                        <Ionicons name="heart" size={18} color={COLORS.green} />
                    </View>
                    <Text style={{ color: '#8e8e8e', fontSize: 14, fontWeight: '500' }}>Heart Rate</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                    <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
                        124
                    </Text>
                    <Text style={{ color: '#666', fontSize: 13, marginLeft: 4, marginBottom: 3 }}>bpm</Text>
                </View>
            </View>
        </View>
    );
}
