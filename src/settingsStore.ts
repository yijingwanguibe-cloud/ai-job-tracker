import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  deepseekApiKey: string;
  setDeepseekApiKey: (apiKey: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      deepseekApiKey: '',
      setDeepseekApiKey: (apiKey) => set({ deepseekApiKey: apiKey })
    }),
    {
      name: 'ai-job-tracker-settings'
    }
  )
);
