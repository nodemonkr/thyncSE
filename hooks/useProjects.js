// hooks/useProjects.js
import { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiProvider';

export default function useProjects() {
  const api = useApi();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load(){
    setLoading(true);
    const { data, error } = await api.fetchProjects();
    setLoading(false);
    if (error) { console.warn('load projects error', error); return { error }; }
    setProjects(data || []);
    return { data };
  }

  async function create(payload){
    const { data, error } = await api.createProject(payload);
    if (!error) setProjects(prev => [data, ...prev]);
    return { data, error };
  }

  async function update(item){
    const { data, error } = await api.updateProject(item);
    if (!error) setProjects(prev => prev.map(p => p.id === data.id ? data : p));
    return { data, error };
  }

  useEffect(()=>{ load(); }, []);

  return { projects, loading, load, create, update };
}
