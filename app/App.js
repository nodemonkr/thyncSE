// app/App.js
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Main from './Main';

export default function App() {
  // expo-router 이미 NavigationContainer를 제공하므로
  // 여기서 추가로 NavigationContainer를 만들면 안 됨.
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}
