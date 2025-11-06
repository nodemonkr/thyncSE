// app/projects/[code].js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const LOCAL_KEY = '@thync_projects_v1';

function defaultMaterials() {
  return {
    switch: { ubiq_8:0, ubiq_24:0, ubiq_48:0, cisco_8:0, cisco_24:0, cisco_48:0 },
    dashboard: { dash_65:0, dash_50:0, dash_43:0, bracket_440F_ceiling:0, bracket_6400F_wall:0 },
    monitor: { monitor_27:0, monitor_24:0 },
    hubrack: { hubrack_300:0, hubrack_750:0, highbox:0 },
    serverrack: { serverrack_750:0, serverrack_1800:0 },
    server: { r450_1u:0, r760_2u:0 },
    others: { wireless_kb_mouse:0, hdmi_5m:0, hdmi_30m:0, dp_to_hdmi:0, rtx3060:0 }
  };
}

export default function ProjectDetail() {
  const { code } = useSearchParams(); // expo-router: URL param name matches [code]
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // project fields
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState(defaultMaterials());

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const found = arr.find(p => p.code === code);
      if (!found) {
        Alert.alert('오류', '해당 프로젝트를 찾을 수 없습니다.');
        router.back();
        return;
      }
      setProject(found);
      setMaterials(found.materials || defaultMaterials());
    } catch (e) {
      console.error('load project err', e);
      Alert.alert('오류', '로컬 데이터 로드 실패');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const idx = arr.findIndex(p => p.code === code);
      if (idx === -1) {
        Alert.alert('오류', '저장 대상 프로젝트를 찾을 수 없습니다.');
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
      Alert.alert('저장 완료', '로컬에 저장했습니다.');
      router.back();
    } catch (e) {
      console.error('save err', e);
      Alert.alert('저장 실패', '저장 중 오류가 발생했습니다.');
    }
  };

  const setMaterialValue = (cat, key, value) => {
    setMaterials(prev => ({ ...prev, [cat]: { ...prev[cat], [key]: Number(value) || 0 } }));
  };
  const changeMaterialBy = (cat, key, delta) => {
    setMaterials(prev => {
      const cur = Number(prev[cat]?.[key] ?? 0);
      const next = Math.max(0, cur + delta);
      return { ...prev, [cat]: { ...prev[cat], [key]: next } };
    });
  };

  const renderNumberInput = (label, value, onChange, onInc, onDec) => (
    <View style={styles.row} key={label}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.counterWrap}>
        <TouchableOpacity style={styles.stepBtn} onPress={onDec}><Text>-</Text></TouchableOpacity>
        <TextInput value={String(value)} keyboardType="numeric" onChangeText={text => onChange(text.replace(/[^0-9]/g, ''))} style={styles.input} />
        <TouchableOpacity style={styles.stepBtn} onPress={onInc}><Text>+</Text></TouchableOpacity>
      </View>
    </View>
  );

  if (loading || !project) return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>불러오는 중...</Text></View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>프로젝트 상세</Text>

      <Text style={styles.sectionTitle}>기본 정보</Text>
      <View style={styles.row}>
        <Text style={styles.label}>병원명</Text>
        <TextInput style={styles.inputFull} value={project.name} onChangeText={t => setProject({...project, name: t})} />
      </View>

      {renderNumberInput('병동수', project.wards, v => setProject({...project, wards: v}), () => setProject(p => ({...p, wards: Number(p.wards||0)+1})), () => setProject(p => ({...p, wards: Math.max(0, Number(p.wards||0)-1)})))}
      {renderNumberInput('병상수', project.beds, v => setProject({...project, beds: v}), () => setProject(p => ({...p, beds: Number(p.beds||0)+1})), () => setProject(p => ({...p, beds: Math.max(0, Number(p.beds||0)-1)})))}
      {renderNumberInput('게이트웨이수', project.gateways, v => setProject({...project, gateways: v}), () => setProject(p => ({...p, gateways: Number(p.gateways||0)+1})), () => setProject(p => ({...p, gateways: Math.max(0, Number(p.gateways||0)-1)})))}

      <Text style={styles.sectionTitle}>납품 자재</Text>

      {/* 스위치 */}
      <Text style={styles.subSection}>[스위치]</Text>
      {renderNumberInput('유비쿼스 8포트 수량', materials.switch.ubiq_8, v => setMaterialValue('switch','ubiq_8',v), () => changeMaterialBy('switch','ubiq_8',1), () => changeMaterialBy('switch','ubiq_8',-1))}
      {renderNumberInput('유비쿼스 24포트 수량', materials.switch.ubiq_24, v => setMaterialValue('switch','ubiq_24',v), () => changeMaterialBy('switch','ubiq_24',1), () => changeMaterialBy('switch','ubiq_24',-1))}
      {renderNumberInput('유비쿼스 48포트 수량', materials.switch.ubiq_48, v => setMaterialValue('switch','ubiq_48',v), () => changeMaterialBy('switch','ubiq_48',1), () => changeMaterialBy('switch','ubiq_48',-1))}
      {renderNumberInput('시스코 8포트 수량', materials.switch.cisco_8, v => setMaterialValue('switch','cisco_8',v), () => changeMaterialBy('switch','cisco_8',1), () => changeMaterialBy('switch','cisco_8',-1))}
      {renderNumberInput('시스코 24포트 수량', materials.switch.cisco_24, v => setMaterialValue('switch','cisco_24',v), () => changeMaterialBy('switch','cisco_24',1), () => changeMaterialBy('switch','cisco_24',-1))}
      {renderNumberInput('시스코 48포트 수량', materials.switch.cisco_48, v => setMaterialValue('switch','cisco_48',v), () => changeMaterialBy('switch','cisco_48',1), () => changeMaterialBy('switch','cisco_48',-1))}

      {/* 대시보드 */}
      <Text style={styles.subSection}>[대시보드]</Text>
      {renderNumberInput('65인치 대시보드 수량', materials.dashboard.dash_65, v => setMaterialValue('dashboard','dash_65',v), () => changeMaterialBy('dashboard','dash_65',1), () => changeMaterialBy('dashboard','dash_65',-1))}
      {renderNumberInput('50인치 대시보드 수량', materials.dashboard.dash_50, v => setMaterialValue('dashboard','dash_50',v), () => changeMaterialBy('dashboard','dash_50',1), () => changeMaterialBy('dashboard','dash_50',-1))}
      {renderNumberInput('43인치 대시보드 수량', materials.dashboard.dash_43, v => setMaterialValue('dashboard','dash_43',v), () => changeMaterialBy('dashboard','dash_43',1), () => changeMaterialBy('dashboard','dash_43',-1))}
      {renderNumberInput('440F 천장형브라켓 수량', materials.dashboard.bracket_440F_ceiling, v => setMaterialValue('dashboard','bracket_440F_ceiling',v), () => changeMaterialBy('dashboard','bracket_440F_ceiling',1), () => changeMaterialBy('dashboard','bracket_440F_ceiling',-1))}
      {renderNumberInput('6400F 벽걸이형브라켓 수량', materials.dashboard.bracket_6400F_wall, v => setMaterialValue('dashboard','bracket_6400F_wall',v), () => changeMaterialBy('dashboard','bracket_6400F_wall',1), () => changeMaterialBy('dashboard','bracket_6400F_wall',-1))}

      {/* 모니터 */}
      <Text style={styles.subSection}>[모니터]</Text>
      {renderNumberInput('27인치 모니터 수량', materials.monitor.monitor_27, v => setMaterialValue('monitor','monitor_27',v), () => changeMaterialBy('monitor','monitor_27',1), () => changeMaterialBy('monitor','monitor_27',-1))}
      {renderNumberInput('24인치 모니터 수량', materials.monitor.monitor_24, v => setMaterialValue('monitor','monitor_24',v), () => changeMaterialBy('monitor','monitor_24',1), () => changeMaterialBy('monitor','monitor_24',-1))}

      {/* 허브랙 */}
      <Text style={styles.subSection}>[허브랙]</Text>
      {renderNumberInput('300사이즈 허브랙 수량', materials.hubrack.hubrack_300, v => setMaterialValue('hubrack','hubrack_300',v), () => changeMaterialBy('hubrack','hubrack_300',1), () => changeMaterialBy('hubrack','hubrack_300',-1))}
      {renderNumberInput('750사이즈 허브랙 수량', materials.hubrack.hubrack_750, v => setMaterialValue('hubrack','hubrack_750',v), () => changeMaterialBy('hubrack','hubrack_750',1), () => changeMaterialBy('hubrack','hubrack_750',-1))}
      {renderNumberInput('하이박스 수량', materials.hubrack.highbox, v => setMaterialValue('hubrack','highbox',v), () => changeMaterialBy('hubrack','highbox',1), () => changeMaterialBy('hubrack','highbox',-1))}

      {/* 서버랙 */}
      <Text style={styles.subSection}>[서버랙]</Text>
      {renderNumberInput('750 서버랙 수량', materials.serverrack.serverrack_750, v => setMaterialValue('serverrack','serverrack_750',v), () => changeMaterialBy('serverrack','serverrack_750',1), () => changeMaterialBy('serverrack','serverrack_750',-1))}
      {renderNumberInput('1800 서버랙 수량', materials.serverrack.serverrack_1800, v => setMaterialValue('serverrack','serverrack_1800',v), () => changeMaterialBy('serverrack','serverrack_1800',1), () => changeMaterialBy('serverrack','serverrack_1800',-1))}

      {/* 서버 */}
      <Text style={styles.subSection}>[서버]</Text>
      {renderNumberInput('R450 1U서버 수량', materials.server.r450_1u, v => setMaterialValue('server','r450_1u',v), () => changeMaterialBy('server','r450_1u',1), () => changeMaterialBy('server','r450_1u',-1))}
      {renderNumberInput('R760 2U서버 수량', materials.server.r760_2u, v => setMaterialValue('server','r760_2u',v), () => changeMaterialBy('server','r760_2u',1), () => changeMaterialBy('server','r760_2u',-1))}

      {/* 기타자재 */}
      <Text style={styles.subSection}>[기타자재]</Text>
      {renderNumberInput('무선 마우스키보드세트 수량', materials.others.wireless_kb_mouse, v => setMaterialValue('others','wireless_kb_mouse',v), () => changeMaterialBy('others','wireless_kb_mouse',1), () => changeMaterialBy('others','wireless_kb_mouse',-1))}
      {renderNumberInput('HDMI 5M선 수량', materials.others.hdmi_5m, v => setMaterialValue('others','hdmi_5m',v), () => changeMaterialBy('others','hdmi_5m',1), () => changeMaterialBy('others','hdmi_5m',-1))}
      {renderNumberInput('HDMI 30M선 수량', materials.others.hdmi_30m, v => setMaterialValue('others','hdmi_30m',v), () => changeMaterialBy('others','hdmi_30m',1), () => changeMaterialBy('others','hdmi_30m',-1))}
      {renderNumberInput('DP to HDMI젠더 수량', materials.others.dp_to_hdmi, v => setMaterialValue('others','dp_to_hdmi',v), () => changeMaterialBy('others','dp_to_hdmi',1), () => changeMaterialBy('others','dp_to_hdmi',-1))}
      {renderNumberInput('RTX3060그래픽카드 수량', materials.others.rtx3060, v => setMaterialValue('others','rtx3060',v), () => changeMaterialBy('others','rtx3060',1), () => changeMaterialBy('others','rtx3060',-1))}

      <View style={{height:20}} />
      <TouchableOpacity style={styles.saveBtn} onPress={save}><Text style={styles.saveText}>저장하기</Text></TouchableOpacity>
      <View style={{height:40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor:'#fff'},
  title:{fontSize:20,fontWeight:'700',marginBottom:12},
  sectionTitle:{fontSize:16,fontWeight:'700',marginTop:12,marginBottom:8},
  subSection:{fontSize:14,fontWeight:'600',marginTop:10,marginBottom:6},
  row:{flexDirection:'row',alignItems:'center',marginBottom:10},
  label:{width:170},
  input:{minWidth:60,padding:8,borderWidth:1,borderColor:'#ddd',borderRadius:6,textAlign:'center'},
  inputFull:{flex:1,padding:8,borderWidth:1,borderColor:'#ddd',borderRadius:6},
  counterWrap:{flexDirection:'row',alignItems:'center'},
  stepBtn:{padding:8,borderWidth:1,borderColor:'#ddd',borderRadius:6,marginHorizontal:6},
  saveBtn:{backgroundColor:'#1976d2',paddingVertical:12,borderRadius:8,alignItems:'center'},
  saveText:{color:'#fff',fontWeight:'700'},
});
