// app/_layout.js
import { MaterialIcons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { Text, TouchableOpacity, View } from 'react-native';

// 드로어 안의 커스텀 컨텐츠(원하면 편집)
function CustomDrawerContent({ state, navigation }) {
  // state.routes 배열을 사용해 등록된 스크린 목록 보여줄 수 있음
  return (
    <View style={{ flex: 1, paddingTop: 40 }}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '800' }}>thyncSE</Text>
        <Text style={{ color: '#666', marginTop: 4 }}>프로젝트 관리</Text>
      </View>

      {/* 고정 링크: 홈 */}
      <TouchableOpacity
        onPress={() => navigation.navigate('index')}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 12, paddingLeft: 18 }}
      >
        <MaterialIcons name="home" size={20} />
        <Text style={{ marginLeft: 12 }}>홈</Text>
      </TouchableOpacity>

      {/* Projects */}
      <TouchableOpacity
        onPress={() => navigation.navigate('projects')}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 12, paddingLeft: 18 }}
      >
        <MaterialIcons name="folder" size={20} />
        <Text style={{ marginLeft: 12 }}>프로젝트</Text>
      </TouchableOpacity>

      {/* 새 프로젝트 만들기 (라우트가 app/projects/new.js 인 경우) */}
      <TouchableOpacity
        onPress={() => navigation.navigate('projects/new')}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 12, paddingLeft: 18 }}
      >
        <MaterialIcons name="add-box" size={20} />
        <Text style={{ marginLeft: 12 }}>새 프로젝트</Text>
      </TouchableOpacity>

      {/* 설정(선택) */}
      <TouchableOpacity
        onPress={() => navigation.navigate('settings')}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 12, paddingLeft: 18, marginTop: 10 }}
      >
        <MaterialIcons name="settings" size={20} />
        <Text style={{ marginLeft: 12 }}>설정</Text>
      </TouchableOpacity>

      {/* 빈 공간 채우기 */}
      <View style={{ flex: 1 }} />

      {/* 로그아웃 / 버전 등 */}
      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#eee' }}>
        <Text style={{ color: '#999' }}>버전: 1.0.0</Text>
      </View>
    </View>
  );
}

export default function Layout() {
  return (
    // Drawer: expo-router/drawer 의 Drawer 컴포넌트 사용
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
      }}
    >
      {/* 파일 기반 라우팅: 각 name은 app/ 폴더 구조에 맞춰 지정 */}
      <Drawer.Screen
        name="index" // app/index.js
        options={{ title: 'Home' }}
      />
      <Drawer.Screen
        name="projects" // app/projects/index.js
        options={{ title: 'Projects' }}
      />
      {/* 하위 경로도 지정 가능(예: projects/new) */}
      <Drawer.Screen
        name="projects/new" // app/projects/new.js
        options={{ title: 'New Project' }}
      />
      <Drawer.Screen
        name="settings" // app/settings.js (없으면 새로 만드세요)
        options={{ title: 'Settings' }}
      />
    </Drawer>
  );
}
