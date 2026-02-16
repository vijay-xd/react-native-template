import React, { useEffect, useState } from 'react';
import { COLORS, CREW_COLORS } from '../constants/theme';
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
import { fetchCrews, createCrew, joinCrew, fetchCrewDetails } from '../services/SocialService';
import { useAuth } from '../context/AuthContext';

const NEON = COLORS.primary;

export default function CrewScreen() {
    const { user } = useAuth();
    const [crews, setCrews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCrew, setSelectedCrew] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Create form
    const [newName, setNewName] = useState('');
    const [newTag, setNewTag] = useState('');
    const [newColor, setNewColor] = useState(CREW_COLORS[0]);
    const [newDesc, setNewDesc] = useState('');
    const [creating, setCreating] = useState(false);

    const loadData = async () => {
        const data = await fetchCrews();
        setCrews(data);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async () => {
        if (!newName.trim() || !newTag.trim()) {
            Alert.alert('Error', 'Name and tag are required');
            return;
        }
        setCreating(true);
        try {
            await createCrew(newName.trim(), newTag.trim().toUpperCase(), newColor, newDesc.trim());
            Alert.alert('✅ Crew Created!');
            setShowCreateModal(false);
            setNewName('');
            setNewTag('');
            setNewDesc('');
            loadData();
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
        setCreating(false);
    };

    const handleJoin = async (crewId: string) => {
        try {
            await joinCrew(crewId);
            Alert.alert('✅ Joined Crew!');
            loadData();
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    };

    const handleViewDetails = async (crewId: string) => {
        const details = await fetchCrewDetails(crewId);
        if (details) {
            setSelectedCrew(details);
            setShowDetailModal(true);
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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 20 }}>
                        <View>
                            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', fontFamily: 'Inter-Bold' }}>
                                Crews
                            </Text>
                            <Text style={{ color: '#666', fontSize: 14, fontFamily: 'Inter-Regular' }}>
                                Join a faction. Dominate.
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
                                Create
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Crew List */}
                    {crews.length === 0 ? (
                        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                            <Ionicons name="shield-outline" size={48} color="#333" />
                            <Text style={{ color: '#555', fontSize: 15, marginTop: 12, fontFamily: 'Inter-Regular' }}>
                                No crews in your city yet. Create one!
                            </Text>
                        </View>
                    ) : (
                        crews.map((crew: any) => (
                            <TouchableOpacity
                                key={crew.id}
                                onPress={() => handleViewDetails(crew.id)}
                                activeOpacity={0.7}
                                style={{
                                    backgroundColor: '#111',
                                    borderRadius: 14,
                                    padding: 16,
                                    marginBottom: 10,
                                    borderWidth: 1,
                                    borderColor: '#1f1f1f',
                                    borderLeftWidth: 4,
                                    borderLeftColor: crew.color || NEON,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800', fontFamily: 'Inter-Bold' }}>
                                                {crew.name}
                                            </Text>
                                            <View
                                                style={{
                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                    borderRadius: 4,
                                                    paddingHorizontal: 6,
                                                    paddingVertical: 2,
                                                }}
                                            >
                                                <Text style={{ color: crew.color || NEON, fontSize: 10, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular' }}>
                                                    [{crew.tag}]
                                                </Text>
                                            </View>
                                        </View>

                                        {crew.description && (
                                            <Text style={{ color: '#666', fontSize: 12, fontFamily: 'Inter-Regular', marginTop: 4 }} numberOfLines={1}>
                                                {crew.description}
                                            </Text>
                                        )}

                                        <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <Ionicons name="people" size={14} color="#888" />
                                                <Text style={{ color: '#888', fontSize: 12, fontFamily: 'SpaceMono-Regular' }}>
                                                    {crew.member_count || 0}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <Ionicons name="map" size={14} color="#888" />
                                                <Text style={{ color: '#888', fontSize: 12, fontFamily: 'SpaceMono-Regular' }}>
                                                    {(crew.total_area_km2 || 0).toFixed(2)} km²
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <Ionicons name="flash" size={14} color="#888" />
                                                <Text style={{ color: '#888', fontSize: 12, fontFamily: 'SpaceMono-Regular' }}>
                                                    {crew.total_runs || 0} runs
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => handleJoin(crew.id)}
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
                                            JOIN
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* Create Crew Modal */}
            <Modal visible={showCreateModal} animationType="slide" transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: '#111', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', fontFamily: 'Inter-Bold' }}>
                                Create Crew
                            </Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <Ionicons name="close" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Inter-Regular', marginBottom: 6 }}>CREW NAME</Text>
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
                            placeholder="e.g. Night Wolves"
                            placeholderTextColor="#555"
                            value={newName}
                            onChangeText={setNewName}
                        />

                        <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Inter-Regular', marginBottom: 6 }}>TAG (3-5 chars)</Text>
                        <TextInput
                            style={{
                                backgroundColor: '#1A1A1A',
                                borderRadius: 10,
                                padding: 14,
                                color: '#fff',
                                fontFamily: 'SpaceMono-Regular',
                                fontSize: 15,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: '#333',
                            }}
                            placeholder="e.g. NW"
                            placeholderTextColor="#555"
                            value={newTag}
                            onChangeText={setNewTag}
                            maxLength={5}
                            autoCapitalize="characters"
                        />

                        <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Inter-Regular', marginBottom: 6 }}>DESCRIPTION</Text>
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
                                minHeight: 60,
                            }}
                            placeholder="What's your crew about?"
                            placeholderTextColor="#555"
                            value={newDesc}
                            onChangeText={setNewDesc}
                            multiline
                        />

                        <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Inter-Regular', marginBottom: 10 }}>CREW COLOR</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                            {CREW_COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => setNewColor(color)}
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 18,
                                        backgroundColor: color,
                                        borderWidth: newColor === color ? 3 : 0,
                                        borderColor: '#fff',
                                    }}
                                />
                            ))}
                        </View>

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
                                    Create Crew
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Crew Detail Modal */}
            <Modal visible={showDetailModal} animationType="slide" transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: '#111', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '80%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: selectedCrew?.color || NEON }} />
                                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', fontFamily: 'Inter-Bold' }}>
                                    {selectedCrew?.name}
                                </Text>
                                <Text style={{ color: selectedCrew?.color || NEON, fontSize: 12, fontFamily: 'SpaceMono-Regular' }}>
                                    [{selectedCrew?.tag}]
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                                <Ionicons name="close" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>

                        {selectedCrew?.description && (
                            <Text style={{ color: '#888', fontSize: 13, fontFamily: 'Inter-Regular', marginBottom: 16 }}>
                                {selectedCrew.description}
                            </Text>
                        )}

                        {/* Crew Stats */}
                        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                            <View style={{ flex: 1, backgroundColor: '#1A1A1A', borderRadius: 10, padding: 12, alignItems: 'center' }}>
                                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular' }}>
                                    {selectedCrew?.member_count || 0}
                                </Text>
                                <Text style={{ color: '#555', fontSize: 9, fontFamily: 'Inter-Regular' }}>MEMBERS</Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: '#1A1A1A', borderRadius: 10, padding: 12, alignItems: 'center' }}>
                                <Text style={{ color: NEON, fontSize: 20, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular' }}>
                                    {(selectedCrew?.total_area_km2 || 0).toFixed(2)}
                                </Text>
                                <Text style={{ color: '#555', fontSize: 9, fontFamily: 'Inter-Regular' }}>KM² OWNED</Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: '#1A1A1A', borderRadius: 10, padding: 12, alignItems: 'center' }}>
                                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', fontFamily: 'SpaceMono-Regular' }}>
                                    {selectedCrew?.total_runs || 0}
                                </Text>
                                <Text style={{ color: '#555', fontSize: 9, fontFamily: 'Inter-Regular' }}>TOTAL RUNS</Text>
                            </View>
                        </View>

                        {/* Members List */}
                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: 'Inter-Bold', marginBottom: 12 }}>
                            Members
                        </Text>
                        <ScrollView style={{ maxHeight: 200 }}>
                            {(selectedCrew?.crew_members || []).map((member: any, index: number) => (
                                <View
                                    key={index}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 10,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#1f1f1f',
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 16,
                                            backgroundColor: '#222',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 10,
                                        }}
                                    >
                                        <Text style={{ fontSize: 14, color: '#fff' }}>
                                            {member.profiles?.username?.charAt(0).toUpperCase() || '?'}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#fff', fontSize: 13, fontFamily: 'Inter-Bold' }}>
                                            {member.profiles?.username || 'Unknown'}
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            backgroundColor: member.role === 'leader' ? NEON : '#333',
                                            borderRadius: 4,
                                            paddingHorizontal: 8,
                                            paddingVertical: 2,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: member.role === 'leader' ? '#000' : '#888',
                                                fontSize: 10,
                                                fontWeight: 'bold',
                                                fontFamily: 'SpaceMono-Regular',
                                                textTransform: 'uppercase',
                                            }}
                                        >
                                            {member.role}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
