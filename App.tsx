import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { COLORS } from './src/constants/theme';

import './global.css';

import Home from './src/pages/Home';
import RunScreen from './src/pages/RunScreen';
import SocialScreen from './src/pages/SocialScreen';
import ProfileScreen from './src/pages/ProfileScreen';
import LeaderboardScreen from './src/pages/LeaderboardScreen';
import CrewScreen from './src/pages/CrewScreen';
import DashboardScreen from './src/pages/DashboardScreen';
import RunRoomsScreen from './src/pages/RunRoomsScreen';
import RoomLobbyScreen from './src/pages/RoomLobbyScreen';
import Login from './src/pages/auth/Login';
import ChallengesScreen from './src/pages/ChallengesScreen';
import BottomBar from './src/components/BottomBar';

const Stack = createNativeStackNavigator();
const NEON = COLORS.primary;
const runnerImage = require('./assets/runner.png');

type SocialSubTab = 'friends' | 'crews' | 'rooms' | 'leaderboard';

const SOCIAL_TABS: { key: SocialSubTab; label: string; icon: string }[] = [
  { key: 'friends', label: 'Friends', icon: '👥' },
  { key: 'crews', label: 'Crews', icon: '🛡️' },
  { key: 'rooms', label: 'Rooms', icon: '🏃' },
  { key: 'leaderboard', label: 'Ranks', icon: '🏆' },
];

function MainApp() {
  const [activeTab, setActiveTab] = useState(0);
  const [socialSubTab, setSocialSubTab] = useState<SocialSubTab>('friends');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [homeSubScreen, setHomeSubScreen] = useState<'home' | 'challenges'>('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 0:
        if (homeSubScreen === 'challenges') {
          return <ChallengesScreen />;
        }
        return <Home runnerImage={runnerImage} onOpenChallenges={() => setHomeSubScreen('challenges')} />;
      case 1:
        // Dashboard Tab (formerly Map/RunRooms)
        return <DashboardScreen />;
      case 2:
        return <RunScreen />;
      case 3:
        // Social tab with sub-navigation
        if (activeRoomId) {
          return <RoomLobbyScreen roomId={activeRoomId} onBack={() => setActiveRoomId(null)} />;
        }
        return renderSocialTab();
      case 4:
        return <ProfileScreen />;
      default:
        return <Home runnerImage={runnerImage} />;
    }
  };

  const renderSocialTab = () => {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Sub-tab bar */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingTop: 54,
            paddingBottom: 6,
            backgroundColor: '#000',
            gap: 6,
          }}
        >
          {SOCIAL_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setSocialSubTab(tab.key)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                paddingVertical: 9,
                borderRadius: 8,
                backgroundColor: socialSubTab === tab.key ? NEON : COLORS.surfaceLight,
                borderWidth: 1,
                borderColor: socialSubTab === tab.key ? NEON : COLORS.border,
              }}
            >
              <Text style={{ fontSize: 12 }}>{tab.icon}</Text>
              <Text
                style={{
                  color: socialSubTab === tab.key ? '#000' : '#888',
                  fontSize: 11,
                  fontWeight: '700',
                  fontFamily: 'Inter-Bold',
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {socialSubTab === 'friends' && <SocialScreen />}
        {socialSubTab === 'crews' && <CrewScreen />}
        {socialSubTab === 'rooms' && <RunRoomsScreen onOpenRoom={(id) => setActiveRoomId(id)} />}
        {socialSubTab === 'leaderboard' && <LeaderboardScreen />}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {renderScreen()}
      <BottomBar
        activeTab={activeTab}
        onTabPress={(tab) => {
          setActiveTab(tab);
          setActiveRoomId(null);
          setHomeSubScreen('home');
        }}
      />
    </View>
  );
}

function RootNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color={NEON} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <Stack.Screen name="Main" component={MainApp} />
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
    'SpaceMono-Regular': SpaceMono_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color={NEON} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
