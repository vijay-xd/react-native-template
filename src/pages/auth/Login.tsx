import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const { signInWithEmail, signInAnonymously } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        const { error } = await signInWithEmail(email);
        setLoading(false);

        if (error) {
            Alert.alert('Login Failed', error.message);
        } else {
            Alert.alert('Check your email', 'We sent you a magic link to login!');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000000', padding: 24, justifyContent: 'center' }}>
            <View>
                <Text style={{ color: '#84cc16', fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
                    RUNNIT.
                </Text>
                <Text style={{ color: '#888', fontSize: 16, marginBottom: 48 }}>
                    Enter the territory.
                </Text>

                <View style={{ marginBottom: 24 }}>
                    <Text style={{ color: '#fff', marginBottom: 8, fontWeight: '600' }}>Email Address</Text>
                    <TextInput
                        style={{
                            backgroundColor: '#1A1A1A',
                            color: '#fff',
                            padding: 16,
                            borderRadius: 12,
                            fontSize: 16,
                            borderWidth: 1,
                            borderColor: '#333',
                        }}
                        placeholder="runner@example.com"
                        placeholderTextColor="#666"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                    style={{
                        backgroundColor: '#84cc16',
                        padding: 16,
                        borderRadius: 12,
                        alignItems: 'center',
                        shadowColor: '#80ff00',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                >
                    {loading ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>
                            SEND MAGIC LINK
                        </Text>
                    )}
                </TouchableOpacity>

                {/* DEV BYPASS BUTTON */}
                <TouchableOpacity
                    onPress={() => signInAnonymously()}
                    style={{
                        marginTop: 24,
                        padding: 12,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: '#555', fontSize: 14 }}>
                        Skip Auth (Dev Mode)
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
