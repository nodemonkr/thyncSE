// app/ProjectDetail.js
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import useProjects from '../hooks/useProjects';

export default function ProjectDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams(); // expo-router에서 쿼리/params 읽기
  const id = params?.id;

  const { projects, loading } = useProjects();

  // id가 있을 때만 프로젝트 찾기
  const project = useMemo(() => {
    if (!id || !projects) return null;
    return projects.find(p => String(p.id) === String(id)) || null;
  }, [id, projects]);

  // 로딩 표시 혹은 프로젝트 없음 처리
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <ActivityIndicator style={{ marginTop: 24 }} />
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <Text style={{ color: '#666', textAlign: 'center', marginTop: 24 }}>
          프로젝트를 찾을 수 없습니다.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>뒤로가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{project.name}</Text>
          <Text style={styles.subtitle}>{project.createdAt ? new Date(project.createdAt).toLocaleString() : ''}</Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeText}>{project.code}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>프로젝트 개요</Text>
        <Text style={styles.bodyText}>여기에 프로젝트의 세부 정보(병동수, 병상수, 게이트웨이 수, 진행 단계 등)를 표시하세요.</Text>

        <View style={{ marginTop: 18 }}>
          <TouchableOpacity style={styles.button} onPress={() => alert('설정 이동 예시')}>
            <Text style={styles.buttonText}>프로젝트 설정</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#f6f7fb' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#111' },
  subtitle: { fontSize: 12, color: '#777', marginTop: 6 },

  codeBadge: { backgroundColor: '#111827', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10 },
  codeText: { color: '#fff', fontWeight: '700' },

  card: { backgroundColor: '#fff', padding: 14, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  sectionTitle: { fontWeight: '700', fontSize: 15, marginBottom: 8 },
  bodyText: { color: '#444', lineHeight: 20 },

  button: { marginTop: 6, backgroundColor: '#2b6ef6', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },

  backBtn: { marginTop: 18, alignSelf: 'center', padding: 10, borderRadius: 8, backgroundColor: '#eee' },
  backText: { color: '#333' },
});
