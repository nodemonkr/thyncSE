// components/ProjectModal.js
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProjectModal({ visible, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [wards, setWards] = useState('');
  const [beds, setBeds] = useState('');
  const [gateways, setGateways] = useState('');
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setName('');
    setWards('');
    setBeds('');
    setGateways('');
  }

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert('입력 오류', '병원명을 입력해주세요.');
      return;
    }
    // 숫자 검증 간단히
    const w = parseInt(wards || '0', 10);
    const b = parseInt(beds || '0', 10);
    const g = parseInt(gateways || '0', 10);
    setLoading(true);
    try {
      await onCreate({ name: name.trim(), wards: w, beds: b, gateways: g });
      resetForm();
      onClose();
    } catch (e) {
      Alert.alert('생성 실패', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>새 프로젝트 생성</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>병원명</Text>
            <TextInput
              style={styles.input}
              placeholder="예) 수성한미병원"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>병동수</Text>
              <TextInput
                style={styles.input}
                placeholder="예) 6"
                keyboardType="numeric"
                value={wards}
                onChangeText={setWards}
              />
            </View>

            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>병상수</Text>
              <TextInput
                style={styles.input}
                placeholder="예) 120"
                keyboardType="numeric"
                value={beds}
                onChangeText={setBeds}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>게이트웨이 수</Text>
            <TextInput
              style={styles.input}
              placeholder="예) 10"
              keyboardType="numeric"
              value={gateways}
              onChangeText={setGateways}
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
              <Text style={styles.createText}>{loading ? '생성중...' : '+ 프로젝트 생성'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const ORANGE = '#ff7a18'; // 주황 테마

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '700' },
  field: { marginVertical: 6 },
  label: { fontSize: 12, color: '#666', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fafafa'
  },
  row: { flexDirection: 'row' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 14, marginRight: 8 },
  cancelText: { color: '#666' },
  createBtn: {
    backgroundColor: ORANGE,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  createText: { color: '#fff', fontWeight: '700' },
});
