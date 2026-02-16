import React, { useEffect, useState, useRef } from 'react';
import { COLORS } from '../constants/theme';

import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
    fetchRoomDetails,
    fetchRoomMembers,
    fetchRoomChat,
    sendChatMessage,
    leaveRoom,
    subscribeToRoomChat,
    subscribeToRoomMembers,
    getPaceEmoji,
    formatStartTime,
    ChatMessage,
    RoomMember,
} from '../services/RunRoomService';
import { useAuth } from '../context/AuthContext';

const NEON = COLORS.primary;

type Props = {
    roomId: string;
    onBack: () => void;
};

export default function RoomLobbyScreen({ roomId, onBack }: Props) {
    const { user } = useAuth();
    const [room, setRoom] = useState<any>(null);
    const [members, setMembers] = useState<RoomMember[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState('');
    const chatScrollRef = useRef<ScrollView>(null);

    // Load initial data
    useEffect(() => {
        const load = async () => {
            const [roomData, membersData, chatData] = await Promise.all([
                fetchRoomDetails(roomId),
                fetchRoomMembers(roomId),
                fetchRoomChat(roomId),
            ]);
            setRoom(roomData);
            setMembers(membersData);
            setMessages(chatData);
            setLoading(false);
        };
        load();
    }, [roomId]);

    // Realtime subscriptions
    useEffect(() => {
        if (!roomId) return;

        const unsubChat = subscribeToRoomChat(roomId, (newMsg) => {
            setMessages((prev) => [...prev, newMsg]);
            setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
        });

        const unsubMembers = subscribeToRoomMembers(roomId, async () => {
            const updated = await fetchRoomMembers(roomId);
            setMembers(updated);
        });

        return () => {
            unsubChat();
            unsubMembers();
        };
    }, [roomId]);

    // Countdown timer
    useEffect(() => {
        if (!room?.start_time) return;

        const update = () => {
            const now = Date.now();
            const start = new Date(room.start_time).getTime();
            const diff = start - now;

            if (diff <= 0) {
                setCountdown('GO! 🏃');
                return;
            }

            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setCountdown(`${mins}:${String(secs).padStart(2, '0')}`);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [room?.start_time]);

    const handleSendMessage = async () => {
        if (!messageText.trim()) return;
        try {
            await sendChatMessage(roomId, messageText.trim());
            setMessageText('');
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    };

    const handleLeave = async () => {
        Alert.alert('Leave Room?', 'You can rejoin later if it\'s still open.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Leave',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await leaveRoom(roomId);
                        onBack();
                    } catch (err: any) {
                        Alert.alert('Error', err.message);
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={NEON} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#000' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#1f1f1f',
                    }}
                >
                    <TouchableOpacity onPress={onBack} style={{ marginRight: 12 }}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800', fontFamily: 'Inter-Bold' }}>
                            {room?.title || 'Run Room'}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                            <Text style={{ fontSize: 12 }}>{getPaceEmoji(room?.pace || 'medium')}</Text>
                            <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Inter-Regular' }}>
                                {room?.pace?.charAt(0).toUpperCase() + (room?.pace?.slice(1) || '')}
                            </Text>
                            <Text style={{ color: '#666', fontSize: 12 }}>•</Text>
                            <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Inter-Regular' }}>
                                📍 {room?.city}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={handleLeave}>
                        <Ionicons name="exit-outline" size={22} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                {/* Countdown Banner */}
                <View
                    style={{
                        backgroundColor: 'rgba(132, 204, 22, 0.08)',
                        paddingVertical: 16,
                        alignItems: 'center',
                        borderBottomWidth: 1,
                        borderBottomColor: '#1f1f1f',
                    }}
                >
                    <Text style={{ color: '#888', fontSize: 11, fontFamily: 'SpaceMono-Regular', letterSpacing: 2, marginBottom: 4 }}>
                        STARTING IN
                    </Text>
                    <Text style={{ color: NEON, fontSize: 40, fontWeight: '900', fontFamily: 'SpaceMono-Regular' }}>
                        {countdown}
                    </Text>
                </View>

                {/* Members Row */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Inter-Regular' }}>
                            Runners ({members.length}/{room?.max_players || 10})
                        </Text>
                        <View
                            style={{
                                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                                borderRadius: 4,
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                            }}
                        >
                            <Text style={{ color: '#22c55e', fontSize: 10, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular' }}>
                                LIVE
                            </Text>
                        </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            {members.map((member) => {
                                const isMe = member.user_id === user?.id;
                                return (
                                    <View key={member.id} style={{ alignItems: 'center', width: 52 }}>
                                        <View
                                            style={{
                                                width: 42,
                                                height: 42,
                                                borderRadius: 21,
                                                backgroundColor: '#222',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderWidth: isMe ? 2 : 1,
                                                borderColor: isMe ? NEON : '#333',
                                            }}
                                        >
                                            <Text style={{ fontSize: 16, color: '#fff' }}>
                                                {member.username?.charAt(0).toUpperCase() || '?'}
                                            </Text>
                                        </View>
                                        <Text
                                            style={{
                                                color: isMe ? NEON : '#888',
                                                fontSize: 9,
                                                fontFamily: 'Inter-Regular',
                                                marginTop: 4,
                                                textAlign: 'center',
                                            }}
                                            numberOfLines={1}
                                        >
                                            {isMe ? 'You' : member.username || '???'}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>

                {/* Chat Area */}
                <ScrollView
                    ref={chatScrollRef}
                    style={{ flex: 1, paddingHorizontal: 16 }}
                    contentContainerStyle={{ paddingVertical: 12 }}
                    onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: false })}
                >
                    {messages.length === 0 && (
                        <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                            <Ionicons name="chatbubble-outline" size={28} color="#333" />
                            <Text style={{ color: '#444', fontSize: 13, marginTop: 8, fontFamily: 'Inter-Regular' }}>
                                Say hi to your fellow runners! 👋
                            </Text>
                        </View>
                    )}
                    {messages.map((msg) => {
                        const isMe = msg.user_id === user?.id;
                        return (
                            <View
                                key={msg.id}
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                                    marginBottom: 8,
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: isMe ? 'rgba(132, 204, 22, 0.15)' : '#1A1A1A',
                                        borderRadius: 14,
                                        borderTopRightRadius: isMe ? 4 : 14,
                                        borderTopLeftRadius: isMe ? 14 : 4,
                                        paddingHorizontal: 14,
                                        paddingVertical: 10,
                                        maxWidth: '75%',
                                    }}
                                >
                                    {!isMe && (
                                        <Text style={{ color: NEON, fontSize: 11, fontWeight: 'bold', fontFamily: 'Inter-Bold', marginBottom: 3 }}>
                                            {msg.username || 'Unknown'}
                                        </Text>
                                    )}
                                    <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Inter-Regular' }}>
                                        {msg.message}
                                    </Text>
                                    <Text style={{ color: '#555', fontSize: 9, fontFamily: 'Inter-Regular', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                                        {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Chat Input */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderTopWidth: 1,
                        borderTopColor: '#1f1f1f',
                        gap: 10,
                    }}
                >
                    <TextInput
                        style={{
                            flex: 1,
                            backgroundColor: '#1A1A1A',
                            borderRadius: 20,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            color: '#fff',
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            borderWidth: 1,
                            borderColor: '#333',
                        }}
                        placeholder="Type a message..."
                        placeholderTextColor="#555"
                        value={messageText}
                        onChangeText={setMessageText}
                        onSubmitEditing={handleSendMessage}
                        returnKeyType="send"
                    />
                    <TouchableOpacity
                        onPress={handleSendMessage}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: messageText.trim() ? NEON : '#333',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons name="send" size={18} color={messageText.trim() ? '#000' : '#666'} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
