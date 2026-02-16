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
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
    fetchFriends,
    fetchPendingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    searchUsers,
    sendFriendRequest,
} from '../services/SocialService';
import { useAuth } from '../context/AuthContext';
import { getTitleForLevel } from '../constants/progression';

const NEON = COLORS.primary;

export default function SocialScreen() {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState<'friends' | 'requests' | 'search'>('friends');
    const [friends, setFriends] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        const [friendsData, requestsData] = await Promise.all([
            fetchFriends(),
            fetchPendingRequests(),
        ]);
        setFriends(friendsData);
        setRequests(requestsData);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        const results = await searchUsers(searchQuery.trim());
        setSearchResults(results);
        setActiveSection('search');
    };

    const handleAccept = async (requestId: string) => {
        try {
            await acceptFriendRequest(requestId);
            Alert.alert('✅ Friend Added!');
            loadData();
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    };

    const handleReject = async (requestId: string) => {
        try {
            await rejectFriendRequest(requestId);
            loadData();
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    };

    const handleSendRequest = async (receiverId: string) => {
        try {
            await sendFriendRequest(receiverId);
            Alert.alert('✅ Request Sent!');
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
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={NEON} />}
                >
                    {/* Header */}
                    <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', fontFamily: 'Inter-Bold', marginTop: 8, marginBottom: 4 }}>
                        Social Hub
                    </Text>
                    <Text style={{ color: '#666', fontSize: 14, fontFamily: 'Inter-Regular', marginBottom: 20 }}>
                        Connect • Compete • Conquer
                    </Text>

                    {/* Search Bar */}
                    <View
                        style={{
                            flexDirection: 'row',
                            backgroundColor: '#111',
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: '#222',
                            marginBottom: 20,
                            alignItems: 'center',
                            paddingHorizontal: 12,
                        }}
                    >
                        <Ionicons name="search" size={18} color="#666" />
                        <TextInput
                            style={{
                                flex: 1,
                                color: '#fff',
                                fontSize: 15,
                                padding: 14,
                                fontFamily: 'Inter-Regular',
                            }}
                            placeholder="Search runners..."
                            placeholderTextColor="#555"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearchQuery(''); setActiveSection('friends'); }}>
                                <Ionicons name="close-circle" size={18} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Tabs */}
                    <View style={{ flexDirection: 'row', marginBottom: 20, gap: 8 }}>
                        {(['friends', 'requests'] as const).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveSection(tab)}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 20,
                                    backgroundColor: activeSection === tab ? NEON : '#1A1A1A',
                                    borderWidth: 1,
                                    borderColor: activeSection === tab ? NEON : '#333',
                                }}
                            >
                                <Text
                                    style={{
                                        color: activeSection === tab ? '#000' : '#888',
                                        fontSize: 13,
                                        fontWeight: '600',
                                        fontFamily: 'Inter-Bold',
                                    }}
                                >
                                    {tab === 'friends' ? `Friends (${friends.length})` : `Requests (${requests.length})`}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Friends List */}
                    {activeSection === 'friends' && (
                        <View>
                            {friends.length === 0 ? (
                                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                                    <Ionicons name="people-outline" size={48} color="#333" />
                                    <Text style={{ color: '#555', fontSize: 15, marginTop: 12, fontFamily: 'Inter-Regular' }}>
                                        No friends yet. Search for runners!
                                    </Text>
                                </View>
                            ) : (
                                friends.map((friend: any) => {
                                    const profile = friend.profiles;
                                    const title = getTitleForLevel(profile?.level || 1);
                                    return (
                                        <View
                                            key={friend.id}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                backgroundColor: '#111',
                                                borderRadius: 12,
                                                padding: 14,
                                                marginBottom: 8,
                                                borderWidth: 1,
                                                borderColor: '#1f1f1f',
                                            }}
                                        >
                                            {/* Avatar */}
                                            <View
                                                style={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 22,
                                                    backgroundColor: '#222',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: 12,
                                                }}
                                            >
                                                <Text style={{ fontSize: 18 }}>
                                                    {profile?.username?.charAt(0).toUpperCase() || '?'}
                                                </Text>
                                            </View>

                                            {/* Info */}
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: 'Inter-Bold' }}>
                                                    {profile?.username || 'Unknown'}
                                                </Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                                    <Text style={{ color: NEON, fontSize: 11, fontFamily: 'SpaceMono-Regular' }}>
                                                        Lv.{profile?.level || 1}
                                                    </Text>
                                                    <Text style={{ color: '#666', fontSize: 11, fontFamily: 'Inter-Regular' }}>
                                                        {title.title}
                                                    </Text>
                                                    <Text style={{ color: '#555', fontSize: 11, fontFamily: 'SpaceMono-Regular' }}>
                                                        {(profile?.total_distance_km || 0).toFixed(1)} km
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* City */}
                                            <Text style={{ color: '#555', fontSize: 11, fontFamily: 'Inter-Regular' }}>
                                                {profile?.city || ''}
                                            </Text>
                                        </View>
                                    );
                                })
                            )}
                        </View>
                    )}

                    {/* Pending Requests */}
                    {activeSection === 'requests' && (
                        <View>
                            {requests.length === 0 ? (
                                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                                    <Ionicons name="mail-outline" size={48} color="#333" />
                                    <Text style={{ color: '#555', fontSize: 15, marginTop: 12, fontFamily: 'Inter-Regular' }}>
                                        No pending requests
                                    </Text>
                                </View>
                            ) : (
                                requests.map((req: any) => {
                                    const profile = req.profiles;
                                    return (
                                        <View
                                            key={req.id}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                backgroundColor: '#111',
                                                borderRadius: 12,
                                                padding: 14,
                                                marginBottom: 8,
                                                borderWidth: 1,
                                                borderColor: '#1f1f1f',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 22,
                                                    backgroundColor: '#222',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: 12,
                                                }}
                                            >
                                                <Text style={{ fontSize: 18 }}>
                                                    {profile?.username?.charAt(0).toUpperCase() || '?'}
                                                </Text>
                                            </View>

                                            <View style={{ flex: 1 }}>
                                                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: 'Inter-Bold' }}>
                                                    {profile?.username || 'Unknown'}
                                                </Text>
                                                <Text style={{ color: '#666', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 2 }}>
                                                    Lv.{profile?.level || 1} • {(profile?.total_distance_km || 0).toFixed(1)} km
                                                </Text>
                                            </View>

                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                <TouchableOpacity
                                                    onPress={() => handleAccept(req.id)}
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 20,
                                                        backgroundColor: NEON,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Ionicons name="checkmark" size={20} color="#000" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => handleReject(req.id)}
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 20,
                                                        backgroundColor: '#333',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Ionicons name="close" size={20} color="#888" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                })
                            )}
                        </View>
                    )}

                    {/* Search Results */}
                    {activeSection === 'search' && (
                        <View>
                            <Text style={{ color: '#888', fontSize: 13, fontFamily: 'Inter-Regular', marginBottom: 12 }}>
                                {searchResults.length} runner{searchResults.length !== 1 ? 's' : ''} found
                            </Text>
                            {searchResults.map((result: any) => (
                                <View
                                    key={result.user_id}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: '#111',
                                        borderRadius: 12,
                                        padding: 14,
                                        marginBottom: 8,
                                        borderWidth: 1,
                                        borderColor: '#1f1f1f',
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 22,
                                            backgroundColor: '#222',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 12,
                                        }}
                                    >
                                        <Text style={{ fontSize: 18 }}>
                                            {result.username?.charAt(0).toUpperCase() || '?'}
                                        </Text>
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: 'Inter-Bold' }}>
                                            {result.username}
                                        </Text>
                                        <Text style={{ color: '#666', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 2 }}>
                                            Lv.{result.level || 1} • {result.city || 'Unknown'}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => handleSendRequest(result.user_id)}
                                        style={{
                                            paddingHorizontal: 14,
                                            paddingVertical: 8,
                                            borderRadius: 8,
                                            backgroundColor: 'rgba(132, 204, 22, 0.15)',
                                            borderWidth: 1,
                                            borderColor: NEON,
                                        }}
                                    >
                                        <Text style={{ color: NEON, fontSize: 12, fontWeight: 'bold', fontFamily: 'Inter-Bold' }}>
                                            + ADD
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
