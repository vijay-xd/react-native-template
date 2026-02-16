import React, { useEffect, useState } from 'react';
import { COLORS } from '../constants/theme';

import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Modal,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
    fetchOpenRooms,
    createRunRoom,
    joinRoom,
    RoomPace,
    getPaceEmoji,
    getPaceLabel,
    formatStartTime,
} from '../services/RunRoomService';

const NEON = COLORS.primary;

const PACE_OPTIONS: RoomPace[] = ['slow', 'medium', 'fast'];

export default function RunRoomsScreen({ onOpenRoom }: { onOpenRoom?: (roomId: string) => void }) {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create form
    const [newTitle, setNewTitle] = useState('');
    const [newPace, setNewPace] = useState<RoomPace>('medium');
    const [newMaxPlayers, setNewMaxPlayers] = useState(10);
    const [newStartMinutes, setNewStartMinutes] = useState(15);
    const [creating, setCreating] = useState(false);

    const loadData = async () => {
        const data = await fetchOpenRooms();
        setRooms(data);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async () => {
        if (!newTitle.trim()) {
            Alert.alert('Error', 'Room title is required');
            return;
        }
        setCreating(true);
        try {
            const startTime = new Date(Date.now() + newStartMinutes * 60 * 1000).toISOString();
            const room = await createRunRoom({
                title: newTitle.trim(),
                city: 'Chennai',
                startTime,
                maxPlayers: newMaxPlayers,
                pace: newPace,
            });
            Alert.alert('✅ Room Created!', 'Others can now join your run.');
            setShowCreateModal(false);
            setNewTitle('');
            loadData();
            onOpenRoom?.(room.id);
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
        setCreating(false);
    };

    const handleJoin = async (roomId: string) => {
        try {
            await joinRoom(roomId);
            Alert.alert('✅ Joined!');
            loadData();
            onOpenRoom?.(roomId);
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={NEON} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={NEON} />
                    }
                >
                    {/* Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 6 }}>
                        <View>
                            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', fontFamily: 'Inter-Bold' }}>
                                Run Rooms
                            </Text>
                            <Text style={{ color: '#666', fontSize: 14, fontFamily: 'Inter-Regular' }}>
                                Join a public run near you
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShowCreateModal(true)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                borderRadius: 10,
                                backgroundColor: NEON,
                            }}
                        >
                            <Ionicons name="add" size={18} color="#000" />
                            <Text style={{ color: '#000', fontSize: 13, fontWeight: 'bold', fontFamily: 'Inter-Bold' }}>
                                Host
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Info Banner */}
                    <View
                        style={{
                            flexDirection: 'row',
                            backgroundColor: 'rgba(132, 204, 22, 0.08)',
                            borderRadius: 12,
                            padding: 14,
                            marginVertical: 16,
                            alignItems: 'center',
                            gap: 12,
                            borderWidth: 1,
                            borderColor: 'rgba(132, 204, 22, 0.2)',
                        }}
                    >
                        <Ionicons name="information-circle-outline" size={22} color={NEON} />
                        <Text style={{ color: '#aaa', fontSize: 12, fontFamily: 'Inter-Regular', flex: 1 }}>
                            Join a room, chat with runners, and start together. Party bonuses apply:{' '}
                            <Text style={{ color: NEON, fontWeight: 'bold' }}>+20% XP</Text> for group runs!
                        </Text>
                    </View>

                    {/* Room List */}
                    {rooms.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingVertical: 50 }}>
                            <Ionicons name="people-circle-outline" size={56} color="#333" />
                            <Text style={{ color: '#555', fontSize: 16, marginTop: 16, fontFamily: 'Inter-Regular' }}>
                                No open rooms right now
                            </Text>
                            <Text style={{ color: '#444', fontSize: 13, marginTop: 6, fontFamily: 'Inter-Regular' }}>
                                Be the first to host one!
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowCreateModal(true)}
                                style={{
                                    marginTop: 20,
                                    paddingHorizontal: 24,
                                    paddingVertical: 12,
                                    borderRadius: 10,
                                    backgroundColor: NEON,
                                }}
                            >
                                <Text style={{ color: '#000', fontWeight: 'bold', fontFamily: 'Inter-Bold' }}>
                                    Create a Room
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        rooms.map((room: any) => (
                            <TouchableOpacity
                                key={room.id}
                                onPress={() => onOpenRoom?.(room.id)}
                                activeOpacity={0.7}
                                style={{
                                    backgroundColor: '#111',
                                    borderRadius: 14,
                                    padding: 16,
                                    marginBottom: 10,
                                    borderWidth: 1,
                                    borderColor: '#1f1f1f',
                                }}
                            >
                                {/* Row 1: Title + Time */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <View style={{ flex: 1, marginRight: 12 }}>
                                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', fontFamily: 'Inter-Bold' }}>
                                            {room.title}
                                        </Text>
                                        <Text style={{ color: '#666', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 3 }}>
                                            📍 {room.city}
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            backgroundColor: 'rgba(132, 204, 22, 0.15)',
                                            borderRadius: 8,
                                            paddingHorizontal: 10,
                                            paddingVertical: 5,
                                        }}
                                    >
                                        <Text style={{ color: NEON, fontSize: 12, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular' }}>
                                            {formatStartTime(room.start_time)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Row 2: Stats */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                    {/* Pace */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Text style={{ fontSize: 14 }}>{getPaceEmoji(room.pace)}</Text>
                                        <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Inter-Regular' }}>
                                            {room.pace.charAt(0).toUpperCase() + room.pace.slice(1)}
                                        </Text>
                                    </View>

                                    {/* Players */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Ionicons name="people" size={14} color="#888" />
                                        <Text style={{ color: '#888', fontSize: 12, fontFamily: 'SpaceMono-Regular' }}>
                                            {room.member_count || 0}/{room.max_players}
                                        </Text>
                                    </View>

                                    {/* Status tag */}
                                    <View
                                        style={{
                                            backgroundColor: room.status === 'open'
                                                ? 'rgba(34, 197, 94, 0.15)'
                                                : 'rgba(239, 68, 68, 0.15)',
                                            borderRadius: 4,
                                            paddingHorizontal: 8,
                                            paddingVertical: 3,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: room.status === 'open' ? '#22c55e' : '#ef4444',
                                                fontSize: 10,
                                                fontWeight: 'bold',
                                                fontFamily: 'SpaceMono-Regular',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {room.status}
                                        </Text>
                                    </View>

                                    {/* Spacer + Join */}
                                    <View style={{ flex: 1 }} />
                                    {room.status === 'open' && (
                                        <TouchableOpacity
                                            onPress={() => handleJoin(room.id)}
                                            style={{
                                                paddingHorizontal: 16,
                                                paddingVertical: 8,
                                                borderRadius: 8,
                                                backgroundColor: NEON,
                                            }}
                                        >
                                            <Text style={{ color: '#000', fontSize: 12, fontWeight: 'bold', fontFamily: 'Inter-Bold' }}>
                                                JOIN
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* Create Room Modal */}
            <Modal visible={showCreateModal} animationType="slide" transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: '#111', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', fontFamily: 'Inter-Bold' }}>
                                Host a Run
                            </Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <Ionicons name="close" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>

                        {/* Title */}
                        <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Inter-Regular', marginBottom: 6 }}>
                            ROOM TITLE
                        </Text>
                        <TextInput
                            style={{
                                backgroundColor: '#1A1A1A',
                                borderRadius: 10,
                                padding: 14,
                                color: '#fff',
                                fontFamily: 'Inter-Regular',
                                fontSize: 15,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: '#333',
                            }}
                            placeholder="e.g. Morning Beach Sprint"
                            placeholderTextColor="#555"
                            value={newTitle}
                            onChangeText={setNewTitle}
                        />

                        {/* Pace */}
                        <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Inter-Regular', marginBottom: 8 }}>
                            PACE
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                            {PACE_OPTIONS.map((pace) => (
                                <TouchableOpacity
                                    key={pace}
                                    onPress={() => setNewPace(pace)}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 12,
                                        borderRadius: 10,
                                        backgroundColor: newPace === pace ? NEON : '#1A1A1A',
                                        borderWidth: 1,
                                        borderColor: newPace === pace ? NEON : '#333',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{ fontSize: 18, marginBottom: 4 }}>{getPaceEmoji(pace)}</Text>
                                    <Text
                                        style={{
                                            color: newPace === pace ? '#000' : '#888',
                                            fontSize: 12,
                                            fontWeight: 'bold',
                                            fontFamily: 'Inter-Bold',
                                        }}
                                    >
                                        {pace.charAt(0).toUpperCase() + pace.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Start Time */}
                        <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Inter-Regular', marginBottom: 8 }}>
                            STARTS IN
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                            {[5, 15, 30, 60].map((min) => (
                                <TouchableOpacity
                                    key={min}
                                    onPress={() => setNewStartMinutes(min)}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 10,
                                        borderRadius: 8,
                                        backgroundColor: newStartMinutes === min ? NEON : '#1A1A1A',
                                        borderWidth: 1,
                                        borderColor: newStartMinutes === min ? NEON : '#333',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: newStartMinutes === min ? '#000' : '#888',
                                            fontSize: 13,
                                            fontWeight: 'bold',
                                            fontFamily: 'SpaceMono-Regular',
                                        }}
                                    >
                                        {min < 60 ? `${min}m` : '1h'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Max Players */}
                        <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Inter-Regular', marginBottom: 8 }}>
                            MAX PLAYERS
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                            {[5, 10, 20, 50].map((count) => (
                                <TouchableOpacity
                                    key={count}
                                    onPress={() => setNewMaxPlayers(count)}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 10,
                                        borderRadius: 8,
                                        backgroundColor: newMaxPlayers === count ? NEON : '#1A1A1A',
                                        borderWidth: 1,
                                        borderColor: newMaxPlayers === count ? NEON : '#333',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: newMaxPlayers === count ? '#000' : '#888',
                                            fontSize: 13,
                                            fontWeight: 'bold',
                                            fontFamily: 'SpaceMono-Regular',
                                        }}
                                    >
                                        {count}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Create Button */}
                        <TouchableOpacity
                            onPress={handleCreate}
                            disabled={creating}
                            style={{
                                backgroundColor: NEON,
                                borderRadius: 12,
                                padding: 16,
                                alignItems: 'center',
                                opacity: creating ? 0.5 : 1,
                            }}
                        >
                            {creating ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <Text style={{ color: '#000', fontSize: 16, fontWeight: '800', fontFamily: 'Inter-Bold' }}>
                                    🏃 Host This Run
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
