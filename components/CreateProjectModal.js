// components/CreateProjectModal.js
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateProjectModal({ visible, onClose, onCreate }) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) setName('');
  }, [visible]);

  const trimmed = name.trim();
  const disabled = submitting || trimmed.length === 0;

  async function handleCreate() {
    if (trimmed.length === 0) return;
    setSubmitting(true);
    try {
      const created = await onCreate({ name: trimmed });
      setName('');
      onClose(created);
    } catch (e) {
      console.warn('create project failed', e);
      onClose(null, e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={() => onClose()}
      presentationStyle="overFullScreen"
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center' }}
          keyboardVerticalOffset={insets.top}
        >
          <View style={[styles.container, { marginHorizontal: 20, marginBottom: insets.bottom + 18 }]}>
            <Text style={styles.title}>새 프로젝트 생성</Text>

            <Text style={styles.label}>병원 이름 (필수)</Text>
            <TextInput
              style={styles.input}
              placeholder="병원 이름을 입력하세요"
              value={name}
              onChangeText={setName}
              editable={!submitting}
              returnKeyType="done"
              onSubmitEditing={() => { if (!disabled) handleCreate(); }}
            />

            <View style={styles.row}>
              <Pressable
                onPress={() => { setName(''); onClose(); }}
                style={[styles.button, styles.cancel]}
                accessibilityRole="button"
              >
                <Text style={[styles.btnText, { color: '#222' }]}>취소</Text>
              </Pressable>

              <Pressable
                onPress={handleCreate}
                disabled={disabled}
                style={[
                  styles.button,
                  disabled ? styles.buttonDisabled : styles.buttonPrimary,
                ]}
                accessibilityRole="button"
              >
                {submitting ? <ActivityIndicator /> : <Text style={styles.btnText}>생성</Text>}
              </Pressable>
            </View>

            {trimmed.length === 0 ? <Text style={styles.hint}>병원 이름은 반드시 입력해야 합니다.</Text> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.36)',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 8,
    // 그림자 (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 13, color: '#333', marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#e6e6e6',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#fafafa',
  },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  button: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8, minWidth: 84, alignItems: 'center' },
  cancel: { backgroundColor: '#f0f0f0' },
  buttonPrimary: { backgroundColor: '#2b6ef6' },
  buttonDisabled: { backgroundColor: '#cfd8ff' },
  btnText: { color: 'white', fontWeight: '700' },
  hint: { marginTop: 8, color: '#b00020' },
});
