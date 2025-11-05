// hooks/useProjects.js
import { useCallback, useEffect, useState } from 'react';
import * as api from '../lib/api/mockProjectsApi';

export default function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchProjects();
      setProjects(data);
    } catch (e) {
      console.warn('load projects failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(async (payload) => {
    // payload: { name, ... }
    const created = await api.createProject(payload);
    // state 갱신 (가장 위에 추가)
    setProjects(prev => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id, patch) => {
    const updated = await api.updateProject(id, patch);
    setProjects(prev => prev.map(p => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    await api.deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    return true;
  }, []);

  return {
    projects,
    loading,
    load,
    create,
    update,
    remove,
  };
}
