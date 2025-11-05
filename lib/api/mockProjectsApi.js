// lib/api/mockProjectsApi.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'thync_projects_v1';

// 유니크 코드 생성기 (영대문자 + 숫자)
function randomCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s = '';
  for (let i = 0; i < length; i++) {
    s += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return s;
}

async function loadAllProjects() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveAllProjects(projects) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export async function fetchProjects() {
  return loadAllProjects();
}

/**
 * projectInput: { name: string, ...optional }
 * - name은 필수 (병원 이름)
 * 반환: 생성된 프로젝트 객체 (code 포함)
 */
export async function createProject(projectInput) {
  const name = (projectInput?.name || '').trim();
  if (!name) {
    const err = new Error('병원 이름을 입력해야 합니다.');
    err.code = 'NO_NAME';
    throw err;
  }

  const projects = await loadAllProjects();

  // 중복되지 않는 코드 생성 (최대 시도 10번)
  let code;
  let tries = 0;
  do {
    code = randomCode(8);
    tries++;
    if (tries > 20) {
      // 거의 일어나지 않지만 안전장치
      throw new Error('고유 코드 생성에 실패했습니다. 다시 시도해주세요.');
    }
  } while (projects.some(p => p.code === code));

  const newProject = {
    id: `${Date.now()}`, // 간단한 id
    code,
    name,
    createdAt: new Date().toISOString(),
    // 필요한 다른 기본 필드가 있으면 추가
  };

  projects.unshift(newProject);
  await saveAllProjects(projects);

  return newProject;
}

export async function updateProject(id, patch) {
  const projects = await loadAllProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('프로젝트를 찾을 수 없습니다.');
  projects[idx] = { ...projects[idx], ...patch };
  await saveAllProjects(projects);
  return projects[idx];
}

export async function deleteProject(id) {
  let projects = await loadAllProjects();
  projects = projects.filter(p => p.id !== id);
  await saveAllProjects(projects);
  return true;
}
