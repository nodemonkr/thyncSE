// app/projects/index.js
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { supabase } from '../../lib/api/supabaseClient';

const LOCAL_KEY = '@thync_projects_v1';
const ORANGE = '#ff7a18';

export default function ProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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
          await saveLocal(data || []);
        }
      } else {
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

  const onPressCard = (item) => {
    if (!item || !item.code) {
      Alert.alert('오류', '해당 프로젝트에 코드가 없습니다.');
      return;
    }
    router.push(`/projects/${item.code}`);
  };

  const onCreateNew = () => {
    router.push('/projects/new');
  };

  const deleteProject = async (item) => {
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
        },
      },
    ]);
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
          <TouchableOpacity style={styles.createBtn} onPress={onCreateNew}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>새 프로젝트</Text>
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
            <ProjectCard item={item} onPress={() => onPressCard(item)} onDelete={() => deleteProject(item)} />
          )}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hTitle: { fontSize: 22, fontWeight: '800' },
  hSub: { color: '#666', marginTop: 4 },
  refreshBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 12,
  },
  createBtn: {
    backgroundColor: ORANGE,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  }
});
