// lib/api/mockProjectsApi.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'mock_projects_v1';

function randomCode(len = 6){
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i=0;i<len;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}

async function loadAll(){
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const sample = [{
      id: Date.now(),
      name: '샘플 병원',
      code: randomCode(),
      ward_count: 2, bed_count: 20, gateway_count: 1, progress_stage: 0,
      created_at: new Date().toISOString()
    }];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    return sample;
  }
  return JSON.parse(raw);
}

async function saveAll(list){
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function fetchProjects(){ try { return { data: await loadAll() }; } catch (error) { return { error }; } }

export async function createProject({ name, ward_count=0, bed_count=0, gateway_count=0 }){
  try {
    const list = await loadAll();
    const item = { id: Date.now(), name, code: randomCode(), ward_count, bed_count, gateway_count, progress_stage: 0, created_at: new Date().toISOString() };
    list.unshift(item); await saveAll(list); return { data: item };
  } catch (error) { return { error }; }
}

export async function updateProject(updated){
  try {
    const list = await loadAll();
    const idx = list.findIndex(i => i.id === updated.id);
    if (idx === -1) return { error: new Error('Not found') };
    list[idx] = { ...list[idx], ...updated, updated_at: new Date().toISOString() };
    await saveAll(list); return { data: list[idx] };
  } catch (error) { return { error }; }
}

export async function deleteProject(id){
  try {
    const list = await loadAll();
    const newList = list.filter(i => i.id !== id);
    await saveAll(newList); return { data: true };
  } catch (error) { return { error }; }
}
