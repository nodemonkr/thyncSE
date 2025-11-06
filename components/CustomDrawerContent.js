// components/CustomDrawerContent.js
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// 색상
const ORANGE = '#ff7a18';
const INACTIVE = '#7a7a7a';

// 메뉴 정의 (projects/index 대신 path '/projects'로 이동)
const NAV_ITEMS = [
  { key: 'index', label: '홈', icon: (c,s) => <Ionicons name="home" size={s} color={c} />, path: '/' },
  { key: 'projects', label: '프로젝트', icon: (c,s) => <MaterialCommunityIcons name="folder-network" size={s} color={c} />, path: '/projects' },
  { key: 'inventory', label: '재고관리', icon: (c,s) => <Ionicons name="cube" size={s} color={c} />, path: '/inventory' },
  { key: 'profile', label: '내정보', icon: (c,s) => <Ionicons name="person" size={s} color={c} />, path: '/profile' },
  { key: 'settings', label: '설정', icon: (c,s) => <Ionicons name="settings" size={s} color={c} />, path: '/settings' },
];

export default function CustomDrawerContent(props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [pathname, setPathname] = useState('');

  // load user if any
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('@thync_user');
        if (!mounted) return;
        setUser(raw ? JSON.parse(raw) : null);
      } catch (e) {
        console.warn('load user err', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 안전하게 현재 경로 얻기: 우선 usePathname (expo-router) 시도 -> props.state fallback
  useEffect(() => {
    let mounted = true;
    try {
      const mod = require('expo-router');
      const usePathname = mod && mod.usePathname;
      if (typeof usePathname === 'function') {
        const p = usePathname();
        if (mounted) setPathname(p || '');
        return () => { mounted = false; };
      }
    } catch (e) {
      // ignore
    }
    // fallback: props.state
    try {
      const idx = props?.state?.index ?? 0;
      const routeName = props?.state?.routes?.[idx]?.name ?? '';
      if (mounted) setPathname(routeName ? `/${routeName}` : '');
    } catch (e) {
      if (mounted) setPathname('');
    }
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.state]);

  // active 판단: pathname이나 route name에 'projects' 포함되면 프로젝트 active
  const isActive = (item) => {
    if (!pathname) return false;
    try {
      const p = pathname.startsWith('/') ? pathname : `/${pathname}`;
      // 예: '/projects', '/projects/ABC', '/projects?x=1' 등 대응
      return p === item.path || p.startsWith(item.path + '/') || p.startsWith(item.path + '?');
    } catch (e) {
      return false;
    }
  };

  // 안전한 이동 함수
  const go = async (item) => {
    try {
      await router.push(item.path);
      try { props?.navigation?.closeDrawer?.(); } catch (_) {}
    } catch (e) {
      // fallback: navigation.navigate with route name (strip '/')
      try {
        const routeName = item.path === '/' ? 'index' : item.path.replace(/^\//,'').split('/')[0];
        props?.navigation?.navigate?.(routeName);
        props?.navigation?.closeDrawer?.();
      } catch (e2) { console.warn('nav fallback err', e2); }
    }
  };

  const handleLogout = async () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃', style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('@thync_user');
            await AsyncStorage.removeItem('@thync_token');
            try { props?.navigation?.closeDrawer?.(); } catch (_) {}
            await router.replace('/login');
          } catch (e) {
            console.warn('logout err', e);
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.header}>
        <View style={styles.logoBox}><Text style={styles.logoText}>T</Text></View>
        <View style={styles.headText}>
          <Text style={styles.brandText}>ThyncSE</Text>
          {user ? <Text style={styles.userName}>{user.name ?? '사용자'}</Text> : <Text style={styles.userName}>로그인이 필요합니다</Text>}
        </View>
      </View>

      <View style={styles.menu}>
        {NAV_ITEMS.map(item => {
          const active = isActive(item);
          return (
            <TouchableOpacity key={item.key} style={[styles.item, active ? styles.itemActive : null]} onPress={() => go(item)}>
              <View style={styles.icon}>{item.icon(active ? ORANGE : INACTIVE, 20)}</View>
              <Text style={[styles.label, active ? { color: ORANGE, fontWeight: '800' } : null]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.bottom}>
        <Text style={styles.version}>v1.0.0</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = {
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  logoBox: { width: 48, height: 48, borderRadius: 10, backgroundColor: ORANGE, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  headText: { flex: 1 },
  brandText: { fontSize: 18, fontWeight: '800' },
  userName: { color: '#666', marginTop: 4 },

  menu: { paddingHorizontal: 8, marginTop: 8, flex: 1 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10, marginBottom: 6 },
  itemActive: { backgroundColor: 'rgba(255,122,24,0.08)' },
  icon: { width: 36, alignItems: 'center', marginRight: 8 },
  label: { fontSize: 15, color: INACTIVE },

  bottom: { paddingHorizontal: 16, paddingBottom: 8, paddingTop: 8 },
  version: { color: '#999', fontSize: 12, marginBottom: 8 },
  logoutBtn: { backgroundColor: ORANGE, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '800' }
};
