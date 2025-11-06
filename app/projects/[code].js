// app/projects/[code].js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    InteractionManager,
    ScrollView, StyleSheet,
    Switch,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const LOCAL_KEY = '@thync_projects_v1';
const ORANGE = '#ff7a18';
const BORDER = '#e6e6e6';
const CARD_BG = '#fafafa';
const BADGE_BG = '#eaf2ff';

// === MATERIAL_DEFINITION ===
// 변경: bracket_440F_ceiling, bracket_6400F_wall 를 'dashboard'에서 제거하고 'others'로 이동
const MATERIAL_DEFINITION = {
  switch: [
    { key: 'ubiq_8', label: '유비쿼스 8포트' },
    { key: 'ubiq_24', label: '유비쿼스 24포트' },
    { key: 'ubiq_48', label: '유비쿼스 48포트' },
    { key: 'cisco_8', label: '시스코 8포트' },
    { key: 'cisco_24', label: '시스코 24포트' },
    { key: 'cisco_48', label: '시스코 48포트' },
  ],
  dashboard: [
    { key: 'dash_65', label: '65인치 대시보드' },
    { key: 'dash_50', label: '50인치 대시보드' },
    { key: 'dash_43', label: '43인치 대시보드' },
    // 브라켓 항목 제거 (요청)
  ],
  monitor: [
    { key: 'monitor_27', label: '27인치 모니터' },
    { key: 'monitor_24', label: '24인치 모니터' },
  ],
  hubrack: [
    { key: 'hubrack_300', label: '300사이즈 허브랙' },
    { key: 'hubrack_750', label: '750사이즈 허브랙' },
    { key: 'highbox', label: '하이박스' },
  ],
  serverrack: [
    { key: 'serverrack_750', label: '750 서버랙' },
    { key: 'serverrack_1800', label: '1800 서버랙' },
  ],
  server: [
    { key: 'r450_1u', label: 'R450 1U서버' },
    { key: 'r760_2u', label: 'R760 2U서버' },
  ],
  desktop: [
    { key: 'dm501tga', label: 'DM501TGA-ZR712' },
    { key: 'nuc', label: 'NUC 미니PC' },
  ],
  others: [
    // 브라켓 항목을 기타자재로 이동
    { key: 'bracket_440F_ceiling', label: '440F 천장형브라켓' },
    { key: 'bracket_6400F_wall', label: '6400F 벽걸이형브라켓' },

    { key: 'wireless_kb_mouse', label: '무선 마우스키보드세트' },
    { key: 'hdmi_5m', label: 'HDMI 5M선' },
    { key: 'hdmi_30m', label: 'HDMI 30M선' },
    { key: 'dp_to_hdmi', label: 'DP to HDMI젠더' },
    { key: 'rtx3060', label: 'RTX3060그래픽카드' },
  ],
};

// DEFAULT_MATERIALS 생성 (모든 카테고리/키에 0)
const DEFAULT_MATERIALS = (() => {
  const out = {};
  Object.keys(MATERIAL_DEFINITION).forEach(cat => {
    out[cat] = {};
    MATERIAL_DEFINITION[cat].forEach(it => { out[cat][it.key] = 0; });
  });
  return out;
})();

const mergeMaterials = (base, existing) => {
  const merged = {};
  Object.keys(base).forEach(cat => {
    merged[cat] = { ...base[cat], ...(existing && existing[cat] ? existing[cat] : {}) };
    Object.keys(merged[cat]).forEach(k => { merged[cat][k] = Number(merged[cat][k] || 0); });
  });
  return merged;
};

// MaterialItem (memoized)
const MaterialItem = React.memo(function MaterialItem({ cat, item, value, onCommit, onDelta }) {
  const [local, setLocal] = useState(String(value ?? 0));

  useEffect(() => {
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

// 카테고리 탭 버튼 (memo)
const CatTab = React.memo(function CatTab({ label, active, onPress }) {
  return (
    <TouchableOpacity style={[styles.tabBtn, active ? styles.tabBtnActive : null]} onPress={onPress}>
      <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{label}</Text>
    </TouchableOpacity>
  );
});

export default function ProjectDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mountedRef = useRef(true);

  // params 안전하게 읽기
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

  // UI: 현재 보여주는 카테고리(탭), 전체 납품자재 열림 여부, 작업현황
  const categories = useMemo(() => Object.keys(MATERIAL_DEFINITION), []);
  const [activeCat, setActiveCat] = useState('switch'); // 기본 'switch' 보여주기
  const [materialsOpen, setMaterialsOpen] = useState(true);
  const [workStatus, setWorkStatus] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    const task = InteractionManager.runAfterInteractions(async () => {
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
        setMaterials(mergeMaterials(DEFAULT_MATERIALS, found.materials || {}));
        setWorkStatus(Boolean(found.workStatus));
      } catch (e) {
        console.error('load project err', e);
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

  // handlers
  const commitMaterial = useCallback((cat, key, value) => {
    setMaterials(prev => ({ ...prev, [cat]: { ...prev[cat], [key]: Number(value) || 0 } }));
  }, []);
  const deltaMaterial = useCallback((cat, key, delta) => {
    setMaterials(prev => {
      const cur = Number(prev[cat]?.[key] || 0);
      const nextVal = Math.max(0, cur + delta);
      return { ...prev, [cat]: { ...prev[cat], [key]: nextVal } };
    });
  }, []);

  const toggleMaterialsOpen = useCallback(() => setMaterialsOpen(v => !v), []);
  const toggleWorkStatus = useCallback(v => setWorkStatus(Boolean(v)), []);

  const totalCountForCategory = useCallback((cat) => {
    return Object.values(materials[cat] || {}).reduce((s, v) => s + Number(v || 0), 0);
  }, [materials]);

  const totalAll = useMemo(() => {
    return Object.keys(materials).reduce((s, cat) => s + totalCountForCategory(cat), 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        workStatus,
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
  }, [code, materials, project, router, workStatus]);

  if (loading || !project) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="small" /><Text style={{marginTop:8}}>불러오는 중...</Text></View>
      </SafeAreaView>
    );
  }

  // 현재 activeCat 항목들
  const currentItems = MATERIAL_DEFINITION[activeCat] || [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 28 }}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>프로젝트 상세</Text>
          <TouchableOpacity style={styles.saveBtnSmall} onPress={save}><Text style={styles.saveTextSmall}>저장</Text></TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>병원명</Text>
          <TextInput style={styles.infoInput} value={project.name} onChangeText={t => setProject(p => ({ ...p, name: t }))} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>병동</Text>
            <TextInput style={styles.statInput} keyboardType="numeric" value={String(project.wards ?? 0)} onChangeText={t => setProject(p => ({ ...p, wards: t.replace(/[^0-9]/g,'') }))} />
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>병상</Text>
            <TextInput style={styles.statInput} keyboardType="numeric" value={String(project.beds ?? 0)} onChangeText={t => setProject(p => ({ ...p, beds: t.replace(/[^0-9]/g,'') }))} />
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>게이트웨이</Text>
            <TextInput style={styles.statInput} keyboardType="numeric" value={String(project.gateways ?? 0)} onChangeText={t => setProject(p => ({ ...p, gateways: t.replace(/[^0-9]/g,'') }))} />
          </View>
        </View>

        {/* 작업현황 토글 */}
        <View style={styles.workRow}>
          <Text style={styles.workLabel}>작업현황</Text>
          <View style={styles.workControls}>
            <Text style={{ marginRight: 8 }}>{workStatus ? '작업중' : '미작업'}</Text>
            <Switch value={workStatus} onValueChange={toggleWorkStatus} thumbColor={workStatus ? ORANGE : '#fff'} trackColor={{ true: '#ffd6c8', false: '#ddd' }} />
          </View>
        </View>

        {/* 납품자재 제목 + 전체 합계 + 전체 토글 */}
        <View style={styles.materialHeaderRow}>
          <Text style={styles.sectionMainTitle}>납품 자재</Text>
          <View style={styles.materialHeaderRight}>
            <Text style={styles.totalText}>총 {totalAll}개</Text>
            <TouchableOpacity onPress={toggleMaterialsOpen} style={styles.foldBtn}>
              <Text style={styles.foldBtnText}>{materialsOpen ? '접기' : '펼치기'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 카테고리 탭 (가로 스크롤) */}
        {materialsOpen && (
          <View style={styles.tabWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 6 }}>
              {categories.map(cat => {
                // 사용자용 레이블
                const label = (() => {
                  switch (cat) {
                    case 'switch': return '스위치';
                    case 'dashboard': return '대시보드';
                    case 'monitor': return '모니터';
                    case 'hubrack': return '허브랙';
                    case 'serverrack': return '서버랙';
                    case 'server': return '서버';
                    case 'desktop': return '데스크톱';
                    case 'others': return '기타자재';
                    default: return cat;
                  }
                })();
                return (
                  <CatTab
                    key={cat}
                    label={`${label} (${totalCountForCategory(cat)})`}
                    active={activeCat === cat}
                    onPress={() => setActiveCat(cat)}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* 선택된 카테고리 항목 리스트 (카드가 아닌 구분하기 쉬운 리스트) */}
        {materialsOpen && (
          <View style={styles.listWrap}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                {(() => {
                  switch (activeCat) {
                    case 'switch': return '스위치';
                    case 'dashboard': return '대시보드';
                    case 'monitor': return '모니터';
                    case 'hubrack': return '허브랙';
                    case 'serverrack': return '서버랙';
                    case 'server': return '서버';
                    case 'desktop': return '데스크톱';
                    case 'others': return '기타자재';
                    default: return activeCat;
                  }
                })()}
              </Text>
              <Text style={styles.listCount}>{totalCountForCategory(activeCat)} 개</Text>
            </View>

            <View style={styles.listBody}>
              {currentItems.length === 0 ? (
                <View style={{ padding: 16 }}><Text style={{ color: '#666' }}>해당 카테고리에 항목이 없습니다.</Text></View>
              ) : (
                currentItems.map(item => (
                  <MaterialItem
                    key={item.key}
                    cat={activeCat}
                    item={item}
                    value={materials[activeCat]?.[item.key] ?? 0}
                    onCommit={commitMaterial}
                    onDelta={deltaMaterial}
                  />
                ))
              )}
            </View>
          </View>
        )}

        <View style={{ height: 36 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6 },
  title: { fontSize: 20, fontWeight: '800' },
  saveBtnSmall: { backgroundColor: ORANGE, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  saveTextSmall: { color: '#fff', fontWeight: '700' },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingHorizontal: 16 },
  infoLabel: { width: 80, fontWeight: '700' },
  infoInput: { flex: 1, padding: 10, borderWidth: 1, borderColor: BORDER, borderRadius: 8 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 16 },
  stat: { width: '32%' },
  statLabel: { color: '#444', marginBottom: 6 },
  statInput: { borderWidth: 1, borderColor: BORDER, padding: 8, borderRadius: 8, textAlign: 'center' },

  workRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: BORDER, borderRadius: 10, backgroundColor: '#fff' },
  workLabel: { fontWeight: '800' },
  workControls: { flexDirection: 'row', alignItems: 'center' },

  materialHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, paddingHorizontal: 6 },
  sectionMainTitle: { fontSize: 16, fontWeight: '800' },
  materialHeaderRight: { flexDirection: 'row', alignItems: 'center' },
  totalText: { color: '#666', marginRight: 12 },
  foldBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: BORDER },
  foldBtnText: { fontWeight: '700' },

  tabWrap: { marginTop: 12, paddingBottom: 6 },
  tabBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginHorizontal: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER },
  tabBtnActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  tabText: { fontWeight: '700', color: '#444' },
  tabTextActive: { color: '#fff' },

  listWrap: { marginTop: 12, borderRadius: 10, borderWidth: 1, borderColor: BORDER, overflow: 'hidden', backgroundColor: '#fff' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: CARD_BG },
  listTitle: { fontWeight: '800' },
  listCount: { color: '#666' },
  listBody: { paddingHorizontal: 12 },

  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  itemLabel: { flex: 1, fontSize: 14, color: '#222' },
  controlWrap: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: BORDER, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8, backgroundColor: '#fff' },
  stepBtnText: { fontSize: 20, fontWeight: '700' },
  input: { width: 70, padding: 8, borderWidth: 1, borderColor: BORDER, borderRadius: 8, textAlign: 'center', backgroundColor: '#fff' },
});
