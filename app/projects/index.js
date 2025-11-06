// app/projects/index.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProjectCard from '../../components/ProjectCard';
import ProjectModal from '../../components/ProjectModal';
import { supabase } from '../../lib/api/supabaseClient'; // 경로: 프로젝트 루트 기준

const ORANGE = '#ff7a18';

function generateCode() {
  // 6자리 영숫자 고유코드 (대문자+숫자)
  const s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += s[Math.floor(Math.random() * s.length)];
  return code;
}

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const LOCAL_KEY = '@thync_projects_v1';
  const router = useRouter();

  const loadLocal = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('loadLocal err', e);
      return [];
    }
  }, []);

  const saveLocal = useCallback(async (list) => {
    try {
      await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('saveLocal err', e);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) {
          console.warn('supabase fetch err', error);
          const local = await loadLocal();
          setProjects(local);
        } else {
          setProjects(data || []);
          // sync local copy
          await saveLocal(data || []);
        }
      } else {
        // fallback to local storage
        const local = await loadLocal();
        setProjects(local);
      }
    } catch (e) {
      console.warn('loadProjects err', e);
      const local = await loadLocal();
      setProjects(local);
    } finally {
      setLoading(false);
    }
  }, [loadLocal, saveLocal]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // 화면이 다시 focus 될 때(다른 화면에서 돌아왔을 때) 목록 갱신
  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects])
  );

  async function createProject(payload) {
    // payload: {name, wards, beds, gateways}
    // generate unique code (check against existing)
    let code;
    let tries = 0;
    do {
      code = generateCode();
      tries++;
      if (tries > 50) break;
    } while (projects.find(p => p.code === code));

    const newProject = {
      name: payload.name,
      wards: payload.wards,
      beds: payload.beds,
      gateways: payload.gateways,
      code,
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase.from('projects').insert([newProject]).select().single();
      if (error) {
        console.warn('supabase insert err', error);
        throw error;
      }
      // refresh list from server
      await loadProjects();
    } else {
      const next = [newProject, ...projects];
      setProjects(next);
      await saveLocal(next);
    }
  }

  async function deleteProject(item) {
    Alert.alert('삭제 확인', `${item.name} 프로젝트를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            if (supabase) {
              const { error } = await supabase.from('projects').delete().eq('code', item.code);
              if (error) throw error;
              await loadProjects();
            } else {
              const next = projects.filter(p => p.code !== item.code);
              setProjects(next);
              await saveLocal(next);
            }
          } catch (e) {
            Alert.alert('삭제 실패', e?.message ?? String(e));
          }
        }
      }
    ]);
  }

  const onPressCard = (item) => {
    // file-based routing: app/projects/[code].js 로 이동
    // item.code 가 존재해야 함
    if (!item || !item.code) {
      Alert.alert('오류', '해당 프로젝트의 코드가 없습니다.');
      return;
    }
    router.push(`/projects/${item.code}`);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hTitle}>프로젝트</Text>
          <Text style={styles.hSub}>진행중인 프로젝트 목록을 관리하세요</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.refreshBtn} onPress={() => loadProjects()}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>새로고침</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : projects.length === 0 ? (
        <View style={{ padding: 20 }}>
          <Text style={{ textAlign: 'center', color: '#666' }}>등록된 프로젝트가 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(it) => it.code}
          renderItem={({ item }) => (
            <ProjectCard
              item={item}
              onPress={() => onPressCard(item)}
              onDelete={deleteProject}
            />
          )}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      )}

      {/* 플로팅 + 버튼 */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+ 프로젝트 생성</Text>
      </TouchableOpacity>

      <ProjectModal visible={modalVisible} onClose={() => setModalVisible(false)} onCreate={createProject} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hTitle: { fontSize: 22, fontWeight: '800' },
  hSub: { color: '#666', marginTop: 4 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 26,
    backgroundColor: ORANGE,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  fabText: { color: '#fff', fontWeight: '800' },
  refreshBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 12,
  }
});
