// components/CustomDrawerContent.js
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/api/supabaseClient'; // 경로 확인

export default function CustomDrawerContent({ state, navigation }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUri, setAvatarUri] = useState(null);

  const randomSeed = useMemo(() => Math.floor(Math.random() * 70) + 1, []);
  const placeholderRemote = useMemo(
    () => `https://i.pravatar.cc/150?img=${randomSeed}`,
    [randomSeed]
  );

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        if (!supabase) {
          if (mounted) {
            setUser(null);
            setAvatarUri(placeholderRemote);
          }
          return;
        }
        if (supabase.auth && supabase.auth.getUser) {
          const { data, error } = await supabase.auth.getUser();
          if (error) {
            if (mounted) {
              setUser(null);
              setAvatarUri(placeholderRemote);
            }
          } else {
            const u = data?.user ?? null;
            if (mounted) {
              setUser(u);
              const avatarFromUser =
                u?.user_metadata?.avatar_url ??
                u?.user_metadata?.avatar ??
                u?.avatar_url ??
                null;
              setAvatarUri(avatarFromUser ?? placeholderRemote);
            }
          }
        } else if (supabase.auth && supabase.auth.user) {
          const u = supabase.auth.user();
          if (mounted) {
            setUser(u);
            const avatarFromUser =
              u?.user_metadata?.avatar_url ??
              u?.user_metadata?.avatar ??
              u?.avatar_url ??
              null;
            setAvatarUri(avatarFromUser ?? placeholderRemote);
          }
        } else {
          if (mounted) {
            setUser(null);
            setAvatarUri(placeholderRemote);
          }
        }
      } catch (e) {
        if (mounted) {
          setUser(null);
          setAvatarUri(placeholderRemote);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadUser();
    return () => { mounted = false; };
  }, [supabase, placeholderRemote]);

  const onImageError = () => {
    setAvatarUri(`https://i.pravatar.cc/150?u=fallback_${Date.now()}`);
  };

  async function handleLogout() {
    try {
      if (supabase && supabase.auth && supabase.auth.signOut) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      Alert.alert('로그아웃', '정상적으로 로그아웃되었습니다.');
      router.replace('/'); // 홈으로 이동 (파일 기반 경로)
    } catch (e) {
      Alert.alert('로그아웃 실패', e.message ?? String(e));
    }
  }

  // routeName: use router.push with absolute path
  function go(routePath) {
    // routePath 예: '/profile', '/projects', '/inventory', '/settings'
    router.push(routePath);
    navigation.closeDrawer?.();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            <Image
              source={avatarUri ? { uri: avatarUri } : { uri: placeholderRemote }}
              style={styles.avatar}
              onError={onImageError}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.name}>
                {user?.email ? (user?.user_metadata?.full_name ?? user.email) : '게스트'}
              </Text>
              <Text style={styles.sub}>{user?.email ?? '로그인되지 않음'}</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => go('/profile')}>
          <Entypo name="user" size={20} />
          <Text style={styles.menuText}>내정보</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => go('/projects')}>
          <MaterialIcons name="folder" size={20} />
          <Text style={styles.menuText}>프로젝트</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => go('/inventory')}>
          <MaterialIcons name="inventory" size={20} />
          <Text style={styles.menuText}>재고관리</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => go('/settings')}>
          <MaterialIcons name="settings" size={20} />
          <Text style={styles.menuText}>설정</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#eee' },
  name: { fontSize: 16, fontWeight: '700' },
  sub: { color: '#666', marginTop: 2, fontSize: 12 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 12 },
  menu: { marginTop: 8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  menuText: { marginLeft: 14, fontSize: 15 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
  version: { marginTop: 8, color: '#999', textAlign: 'center' },
});
