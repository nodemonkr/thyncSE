// lib/api/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Expo config extra 또는 환경변수에서 읽기
const extras = (Constants.expoConfig && Constants.expoConfig.extra) || (Constants.manifest && Constants.manifest.extra) || {};
const SUPABASE_URL = extras.SUPABASE_URL || process.env.SUPABASE_URL || global.__SUPABASE_URL__;
const SUPABASE_ANON_KEY = extras.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || global.__SUPABASE_ANON_KEY__;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[supabaseClient] SUPABASE_URL or SUPABASE_ANON_KEY not set. Using null client.');
}

// 안전하게 client 만들기 (null 체크 허용)
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
