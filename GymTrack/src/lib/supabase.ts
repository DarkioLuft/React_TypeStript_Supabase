import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Memória temporária para ambientes Web onde o localStorage possa estar bloqueado
const webMemoryStorage: Record<string, string> = {};

// Adaptador Inteligente: Web usa localStorage / Mobile usa SecureStore
const universalStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return webMemoryStorage[key] || null;
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        webMemoryStorage[key] = value;
      }
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        delete webMemoryStorage[key];
      }
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

// Substitua pelas suas credenciais reais (ou use arquivos .env com EXPO_PUBLIC_)
const SUPABASE_URL = 'https://husrgltlolzijrvixnlw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MeRV5Ndp13wjYr_MSuaxUA_rDbaB0d8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: universalStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Mantido falso para evitar problemas de roteamento no Expo
  },
});