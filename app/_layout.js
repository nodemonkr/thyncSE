// app/_layout.js
import { Drawer } from 'expo-router/drawer';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomDrawerContent from '../components/CustomDrawerContent';

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerStyle: { width: 280 },
        sceneContainerStyle: { paddingTop: insets.top, paddingBottom: insets.bottom },
        drawerType: Platform.OS === 'ios' ? 'slide' : 'front',
      }}
    >
      {/* 반드시 app 폴더의 실제 파일/폴더명과 매칭 */}
      <Drawer.Screen name="index" options={{ title: '홈' }} />
      <Drawer.Screen name="projects" options={{ title: '프로젝트' }} />
      <Drawer.Screen name="inventory" options={{ title: '재고관리' }} />
      <Drawer.Screen name="profile" options={{ title: '내정보' }} />
      <Drawer.Screen name="settings" options={{ title: '설정' }} />
    </Drawer>
  );
}
