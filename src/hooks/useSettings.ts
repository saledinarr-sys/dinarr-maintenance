import { useState } from 'react';

export interface AppSettings {
  adminName: string;
  adminTitle: string;
  password: string;
  orgName: string;
  orgDept: string;
  sla: { low: number; mid: number; high: number; crit: number };
}

export const DEFAULT_SETTINGS: AppSettings = {
  adminName: 'Admin',
  adminTitle: 'หัวหน้าฝ่าย',
  password: 'dinarr2025',
  orgName: 'Dinarr',
  orgDept: 'ระบบแจ้งซ่อม',
  sla: { low: 24, mid: 8, high: 4, crit: 2 },
};

const STORAGE_KEY = 'dinarr-settings';

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function persistSettings(s: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(getSettings);

  const save = (partial: Partial<AppSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    persistSettings(next);
  };

  return { settings, save };
}
