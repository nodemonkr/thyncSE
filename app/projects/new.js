// app/projects/new.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/api/supabaseClient';

const LOCAL_KEY = '@thync_projects_v1';

function generateCode() {
  const s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += s[Math.floor(Math.random() * s.length)];
  return code;
}

export default function NewProject() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [wards, setWards] = useState('0');
  const [beds, setBeds] = useState('0');
  const [gateways, setGateways] = useState('0');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      // load existing to ensure unique code locally
      const raw = await AsyncStorage.getItem(LOCAL_KEY);
      const arr = raw ? JSON.parse(raw) : [];

      let code = generateCode();
      let tries = 0;
      while (arr.find(p => p.code === code) && tries < 50) {
        code = generateCode();
        tries++;
      }

      const payload = {
        name: name || '무명 프로젝트',
        wards: Number(wards) || 0,
        beds: Number(beds) || 0,
        gateways: Number(gateways) || 0,
        code,
        created_at: new Date().toISOString(),
      };

      if (supabase) {
        const { data, error } = await supabase.from('projects').insert([payload]).select().single();
        if (error) throw error;
        // success -> navigate back
        router.back();
        return;
      } else {
        const next = [payload, ...arr];
        await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(next));
        router.back();
        return;
      }
    } catch (e) {
      console.error(e);
      Alert.alert('저장 실패', e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>새 프로젝트 만들기</Text>

      <Text>병원명</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text style={{ marginTop: 8 }}>병동수</Text>
      <TextInput value={wards} onChangeText={t => setWards(t.replace(/[^0-9]/g, ''))} keyboardType="numeric" style={styles.input} />

      <Text style={{ marginTop: 8 }}>병상수</Text>
      <TextInput value={beds} onChangeText={t => setBeds(t.replace(/[^0-9]/g, ''))} keyboardType="numeric" style={styles.input} />

      <Text style={{ marginTop: 8 }}>게이트웨이수</Text>
      <TextInput value={gateways} onChangeText={t => setGateways(t.replace(/[^0-9]/g, ''))} keyboardType="numeric" style={styles.input} />

      <View style={{ height: 16 }} />

      <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
        <Text style={styles.saveText}>{saving ? '저장 중...' : '저장하기'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginTop: 6 },
  saveBtn: { backgroundColor: '#1976d2', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  saveText: { color: '#fff', fontWeight: '700' },
});
