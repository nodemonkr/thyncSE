// app/_layout.js (또는 덮어쓰기)
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '../components/CustomDrawerContent';

export default function RootLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerStyle: { width: 280 },
      }}
    >
      <Drawer.Screen name="index" options={{ title: '홈' }} />
      {/* 변경: 'projects' -> 'projects/index' */}
      <Drawer.Screen name="projects/index" options={{ title: '프로젝트' }} />
      {/* 이미 존재한다면 projects/new 는 그대로 */}
      <Drawer.Screen name="projects/new" options={{ title: '새 프로젝트' }} />
      <Drawer.Screen name="inventory" options={{ title: '재고관리' }} />
      <Drawer.Screen name="profile" options={{ title: '내정보' }} />
      <Drawer.Screen name="settings" options={{ title: '설정' }} />
    </Drawer>
  );
}
