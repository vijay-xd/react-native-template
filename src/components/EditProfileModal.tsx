import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { COLORS } from '../constants/theme';
import { updateProfile, uploadAvatar } from '../services/SocialService';

type Props = {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    initialData: any;
};

export default function EditProfileModal({ visible, onClose, onSave, initialData }: Props) {
    const [formData, setFormData] = useState({
        username: '',
        display_name: '',
        full_name: '',
        city: '',
        gender: '',
        birth_date: '',
        weight_kg: '',
        height_cm: '',
        bio: '',
        avatar_url: '',
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                username: initialData.username || '',
                display_name: initialData.display_name || '',
                full_name: initialData.full_name || '',
                city: initialData.city || '',
                gender: initialData.gender || '',
                birth_date: initialData.birth_date || '',
                weight_kg: initialData.weight_kg?.toString() || '',
                height_cm: initialData.height_cm?.toString() || '',
                bio: initialData.bio || '',
                avatar_url: initialData.avatar_url || '',
            });
        }
    }, [initialData, visible]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const updates = {
                ...formData,
                weight_kg: parseFloat(formData.weight_kg) || 0,
                height_cm: parseFloat(formData.height_cm) || 0,
                updated_at: new Date().toISOString(),
            };

            await updateProfile(updates);
            onSave();
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setUploading(true);
            try {
                const url = await uploadAvatar(result.assets[0].uri);
                if (url) {
                    setFormData(prev => ({ ...prev, avatar_url: url }));
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to upload image');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleDetectLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Allow location access to detect city');
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const geocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        });

        if (geocode.length > 0) {
            const city = geocode[0].city || geocode[0].region || '';
            setFormData(prev => ({ ...prev, city }));
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: COLORS.background }}
            >
                <View style={{ flex: 1, backgroundColor: COLORS.background }}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: COLORS.border, alignItems: 'center' }}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={{ color: '#888', fontSize: 16 }}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Edit Profile</Text>
                        <TouchableOpacity onPress={handleSave} disabled={loading}>
                            {loading ? <ActivityIndicator color={COLORS.primary} /> : <Text style={{ color: COLORS.primary, fontSize: 16, fontWeight: 'bold' }}>Save</Text>}
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        {/* Avatar */}
                        <View style={{ alignItems: 'center', marginBottom: 24 }}>
                            <TouchableOpacity onPress={handlePickImage} style={{ position: 'relative' }}>
                                <Image
                                    source={{ uri: formData.avatar_url || 'https://via.placeholder.com/100' }}
                                    style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: COLORS.border }}
                                />
                                <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, padding: 6, borderRadius: 15 }}>
                                    <Ionicons name="camera" size={16} color="#000" />
                                </View>
                            </TouchableOpacity>
                            {uploading && <ActivityIndicator style={{ marginTop: 10 }} color={COLORS.primary} />}
                        </View>

                        {/* Fields */}
                        <View style={{ gap: 16 }}>
                            <InputField label="USERNAME" value={formData.username} onChangeText={t => setFormData({ ...formData, username: t })} />
                            <InputField label="DISPLAY NAME" value={formData.display_name} onChangeText={t => setFormData({ ...formData, display_name: t })} />
                            <InputField label="FULL NAME" value={formData.full_name} onChangeText={t => setFormData({ ...formData, full_name: t })} />

                            <View>
                                <Text style={{ color: '#888', fontSize: 10, marginBottom: 6, fontWeight: 'bold' }}>CITY</Text>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <TextInput
                                        style={{ flex: 1, backgroundColor: COLORS.surfaceLight, color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border }}
                                        value={formData.city}
                                        onChangeText={t => setFormData({ ...formData, city: t })}
                                    />
                                    <TouchableOpacity
                                        onPress={handleDetectLocation}
                                        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, backgroundColor: COLORS.surfaceLight, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border }}
                                    >
                                        <Ionicons name="locate" size={16} color="#fff" style={{ marginRight: 6 }} />
                                        <Text style={{ color: '#fff', fontSize: 12 }}>Detect</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 16 }}>
                                <View style={{ flex: 1 }}>
                                    <InputField label="GENDER" value={formData.gender} onChangeText={t => setFormData({ ...formData, gender: t })} placeholder="Male/Female" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <InputField label="DATE OF BIRTH" value={formData.birth_date} onChangeText={t => setFormData({ ...formData, birth_date: t })} placeholder="YYYY-MM-DD" />
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 16 }}>
                                <View style={{ flex: 1 }}>
                                    <InputField label="WEIGHT (KG)" value={formData.weight_kg} onChangeText={t => setFormData({ ...formData, weight_kg: t })} keyboardType="numeric" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <InputField label="HEIGHT (CM)" value={formData.height_cm} onChangeText={t => setFormData({ ...formData, height_cm: t })} keyboardType="numeric" />
                                </View>
                            </View>


                            <View>
                                <Text style={{ color: '#888', fontSize: 10, marginBottom: 6, fontWeight: 'bold' }}>BIO</Text>
                                <TextInput
                                    style={{ backgroundColor: COLORS.surfaceLight, color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, minHeight: 80, textAlignVertical: 'top' }}
                                    value={formData.bio}
                                    onChangeText={t => setFormData({ ...formData, bio: t })}
                                    multiline
                                    maxLength={200}
                                />
                                <Text style={{ color: '#666', fontSize: 10, textAlign: 'right', marginTop: 4 }}>{formData.bio.length}/200</Text>
                            </View>
                        </View>
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}


interface InputFieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

function InputField({ label, value, onChangeText, placeholder, keyboardType }: InputFieldProps) {
    return (
        <View>
            <Text style={{ color: '#888', fontSize: 10, marginBottom: 6, fontWeight: 'bold' }}>{label}</Text>
            <TextInput
                style={{ backgroundColor: COLORS.surfaceLight, color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border }}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#555"
                keyboardType={keyboardType}
            />
        </View>
    );
}

