// contexts/ApiProvider.js
import React, { createContext, useContext } from 'react';
import * as mockApi from '../lib/api/mockProjectsApi';
// import * as supabaseApi from '../lib/api/supabaseProjectsApi'; // 나중에 교체

const ApiContext = createContext();

export function ApiProvider({ children, useMock = true }) {
  const api = useMock ? mockApi : mockApi;
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi() {
  return useContext(ApiContext);
}
