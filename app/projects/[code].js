// app/projects/[code].js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    InteractionManager,
    SectionList, StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';

const LOCAL_KEY = '@thync_projects_v1';

// MATERIAL_DEFINITION (요청하신 전체 항목)
const MATERIAL_DEFINITION = {
  switch: [
    { key: 'ubiq_8', label: '유비쿼스 8포트' },
    { key: 'ubiq_24', label: '유비쿼스 24포트' },
    { key: 'ubiq_48', label: '유비쿼스 48포트' },
    { key: 'cisco_8', label: '시스코 8포트' },
    { key: 'cisco_24', label: '시스코 24포트' },
    { key: 'cisco_48', label: '시스코 48포트' }
  ],
  dashboard: [
    { key: 'dash_65', label: '65인치 대시보드' },
    { key: 'dash_50', label: '50인치 대시보드' },
    { key: 'dash_43', label: '43인치 대시보드' },
    { key: 'bracket_440F_ceiling', label: '440F 천장형브라켓' },
    { key: 'bracket_6400F_wall', label: '6400F 벽걸이형브라켓' }
  ],
  monitor: [
    { key: 'monitor_27', label: '27인치 모니터' },
    { key: 'monitor_24', label: '24인치 모니터' }
  ],
  hubrack: [
    { key: 'hubrack_300', label: '300사이즈 허브랙' },
    { key: 'hubrack_750', label: '750사이즈 허브랙' },
    { key: 'highbox', label: '하이박스' }
  ],
  serverrack: [
    { key: 'serverrack_750', label: '750 서버랙' },
    { key: 'serverrack_1800', label: '1800 서버랙' }
  ],
  server: [
    { key: 'r450_1u', label: 'R450 1U서버' },
    { key: 'r760_2u', label: 'R760 2U서버' }
  ],
  desktop: [
    { key: 'dm501tga', label: 'DM501TGA-ZR712' },
    { key: 'nuc', label: 'NUC 미니PC' }
  ],
  others: [
    { key: 'wireless_kb_mouse', label: '무선 마우스키보드세트' },
    { key: 'hdmi_5m', label: 'HDMI 5M선' },
    { key: 'hdmi_30m', label: 'HDMI 30M선' },
    { key: 'dp_to_hdmi', label: 'DP to HDMI젠더' },
    { key: 'rtx3060', label: 'RTX3060그래픽카드' }
  ]
};

// static default materials 생성 (최초에만)
const DEFAULT_MATERIALS = (() => {
  const out = {};
  Object.keys(MATERIAL_DEFINITION).forEach(cat => {
    out[cat] = {};
    MATERIAL_DEFINITION[cat].forEach(it => { out[cat][it.key] = 0; });
  });
  return out;
})();

// helper: deep merge existing into default
const mergeMaterials = (base, existing) => {
  const merged = {};
  Object.keys(base).forEach(cat => {
    merged[cat] = { ...base[cat], ...(existing && existing[cat] ? existing[cat] : {}) };
    Object.keys(merged[cat]).forEach(k => { merged[cat][k] = Number(merged[cat][k] || 0); });
  });
  return merged;
};

/* MaterialItem: 각 행을 로컬 상태로 관리하여 부모 재렌더 최소화
   - value: 부모가 가진 최신 값
   - onCommit(value): blur 시 부모에 업데이트
   - onDelta(delta): +/- 버튼은 즉시 부모에 알림 (작은 빈도)
*/
const MaterialItem = React.memo(function MaterialItem({ cat, item, value, onCommit, onDelta }) {
  const [local, setLocal] = useState(String(value ?? 0));

  // 외부 value가 바뀌면 로컬 동기화 (하지만 typing 중에는 덮어씌우지 않도록)
  useEffect(() => {
    // only update if different and not focused; for simplicity always sync when parent changes and differs
    if (String(value) !== local) setLocal(String(value ?? 0));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <View style={styles.itemRow}>
      <Text style={styles.itemLabel}>{item.label}</Text>
      <View style={styles.controlWrap}>
        <TouchableOpacity style={styles.stepBtn} onPress={() => onDelta(cat, item.key, -1)}>
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>

        <TextInput
          value={local}
          keyboardType="numeric"
          onChangeText={(t) => setLocal(t.replace(/[^0-9]/g, ''))}
          onBlur={() => {
            const num = Number(local) || 0;
            if (num !== value) onCommit(cat, item.key, num);
          }}
          style={styles.input}
          returnKeyType="done"
        />

        <TouchableOpacity style={styles.stepBtn} onPress={() => onDelta(cat, item.key, 1)}>
          <Text style={styles.stepBtnText}>＋</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// SectionCard: 각 카테고리 헤더 (메모이즈)
const SectionCardHeader = React.memo(function SectionCardHeader({ title, total }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBadge}><Text style={styles.sectionBadgeText}>{total}</Text></View>
    </View>
  );
});

export default function ProjectDetail() {
  const router = useRouter();
  const mountedRef = useRef(true);

  // params safe read
  let params = {};
  try {
    const mod = require('expo-router');
    const useLocalSearchParams = mod && mod.useLocalSearchParams;
    const useSearchParams = mod && mod.useSearchParams;
    if (typeof useLocalSearchParams === 'function') params = useLocalSearchParams() || {};
    else if (typeof useSearchParams === 'function') params = useSearchParams() || {};
    else params = (router && router.params) ? router.params : {};
  } catch (e) {
    params = (router && router.params) ? router.params : {};
  }
  const { code } = params;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState(DEFAULT_MATERIALS);

  // sections for SectionList (memoized)
  const sections = useMemo(() => {
    return Object.keys(MATERIAL_DEFINITION).map(cat => ({
      title: cat,
      data: MATERIAL_DEFINITION[cat]
    }));
  }, []);

  // load only AFTER interactions to avoid blocking navigation transition
  useEffect(() => {
    mountedRef.current = true;
    let task;
    task = InteractionManager.runAfterInteractions(async () => {
      try {
        const raw = await AsyncStorage.getItem(LOCAL_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        const found = arr.find(p => p.code === code);
        if (!found) {
          Alert.alert('오류', '해당 프로젝트를 찾을 수 없습니다.');
          router.back();
          return;
        }
        if (!mountedRef.current) return;
        setProject(found);
        setMaterials(prev => mergeMaterials(DEFAULT_MATERIALS, found.materials || {}));
      } catch (e) {
        console.error('load err', e);
        Alert.alert('로컬 데이터 로드 실패');
        router.back();
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    });
    return () => {
      mountedRef.current = false;
      if (task && typeof task.cancel === 'function') task.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // stable callbacks
  const commitMaterial = useCallback((cat, key, value) => {
    setMaterials(prev => {
      const next = { ...prev, [cat]: { ...prev[cat], [key]: Number(value) || 0 } };
      return next;
    });
  }, []);

  const deltaMaterial = useCallback((cat, key, delta) => {
    setMaterials(prev => {
      const cur = Number(prev[cat]?.[key] || 0);
      const nextVal = Math.max(0, cur + delta);
      return { ...prev, [cat]: { ...prev[cat], [key]: nextVal } };
    });
  }, []);

  const categoryTotal = useCallback((cat) => {
    return Object.values(materials[cat] || {}).reduce((s, v) => s + Number(v || 0), 0);
  }, [materials]);

  const save = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const idx = arr.findIndex(p => p.code === code);
      if (idx === -1) {
        Alert.alert('오류', '저장 대상 프로젝트가 없습니다.');
        return;
      }
      const updated = {
        ...arr[idx],
        name: project.name,
        wards: Number(project.wards) || 0,
        beds: Number(project.beds) || 0,
        gateways: Number(project.gateways) || 0,
        materials,
        updated_at: new Date().toISOString()
      };
      arr[idx] = updated;
      await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(arr));
      Alert.alert('저장 완료', '로컬에 저장되었습니다.');
      router.back();
    } catch (e) {
      console.error('save err', e);
      Alert.alert('저장 실패');
    }
  }, [code, materials, project, router]);

  if (loading || !project) {
    return (
      <View style={styles.center}><ActivityIndicator size="small" /><Text style={{marginTop:8}}>불러오는 중...</Text></View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>프로젝트 상세</Text>
        <TouchableOpacity style={styles.saveBtnSmall} onPress={save}><Text style={styles.saveTextSmall}>저장</Text></TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>병원명</Text>
        <TextInput style={styles.infoInput} value={project.name} onChangeText={(t) => setProject(p => ({...p, name: t}))} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>병동</Text>
          <TextInput style={styles.statInput} keyboardType="numeric" value={String(project.wards ?? 0)} onChangeText={t => setProject(p => ({...p, wards: t.replace(/[^0-9]/g,'')}))} />
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>병상</Text>
          <TextInput style={styles.statInput} keyboardType="numeric" value={String(project.beds ?? 0)} onChangeText={t => setProject(p => ({...p, beds: t.replace(/[^0-9]/g,'')}))} />
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>게이트웨이</Text>
          <TextInput style={styles.statInput} keyboardType="numeric" value={String(project.gateways ?? 0)} onChangeText={t => setProject(p => ({...p, gateways: t.replace(/[^0-9]/g,'')}))} />
        </View>
      </View>

      <Text style={styles.sectionMainTitle}>납품 자재</Text>

      <SectionList
        sections={sections.map(s => ({ ...s, title: s.title }))}
        keyExtractor={(item) => item.key}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionCard}>
            <SectionCardHeader title={section.title} total={categoryTotal(section.title)} />
          </View>
        )}
        renderItem={({ item, section }) => (
          <MaterialItem
            cat={section.title}
            item={item}
            value={materials[section.title]?.[item.key] ?? 0}
            onCommit={commitMaterial}
            onDelta={deltaMaterial}
          />
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      />

    </View>
  );
}

const ACCENT = '#1976d2';
const CARD_BG = '#fafafa';
const BORDER = '#e6e6e6';
const BADGE_BG = '#eaf2ff';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 20, fontWeight: '800' },
  saveBtnSmall: { backgroundColor: ACCENT, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  saveTextSmall: { color: '#fff', fontWeight: '700' },

  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  infoLabel: { width: 80, fontWeight: '700' },
  infoInput: { flex: 1, padding: 10, borderWidth: 1, borderColor: BORDER, borderRadius: 8 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  stat: { width: '32%' },
  statLabel: { color: '#444', marginBottom: 6 },
  statInput: { borderWidth: 1, borderColor: BORDER, padding: 8, borderRadius: 8, textAlign: 'center' },

  sectionMainTitle: { fontSize: 16, fontWeight: '800', paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },

  sectionCard: { backgroundColor: CARD_BG, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: BORDER, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  sectionBadge: { backgroundColor: BADGE_BG, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  sectionBadgeText: { fontWeight: '700', color: ACCENT },

  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  itemLabel: { flex: 1, fontSize: 14, color: '#222' },
  controlWrap: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: BORDER, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8, backgroundColor: '#fff' },
  stepBtnText: { fontSize: 20, fontWeight: '700' },
  input: { width: 70, padding: 8, borderWidth: 1, borderColor: BORDER, borderRadius: 8, textAlign: 'center', backgroundColor: '#fff' },

  saveBtn: { backgroundColor: ACCENT, paddingVertical: 14, borderRadius: 10, alignItems: 'center', margin: 16 },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});
