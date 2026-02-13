import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './global.css';

import Home from './src/pages/Home';

export default function App() {
  return (
    <SafeAreaProvider>
      <Home />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
