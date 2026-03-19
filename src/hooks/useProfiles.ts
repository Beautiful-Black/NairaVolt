import { useState, useCallback, useEffect } from 'react';
import { type UserAppliance, TARIFF_BANDS } from '@/data/appliances';

export interface Profile {
  id: string;
  name: string;
  bandId: string;
  appliances: Array<{
    applianceId: string;
    applianceName: string;
    applianceWatts: number;
    applianceIcon: string;
    applianceTip: string;
    hoursPerDay: number;
    quantity: number;
  }>;
}

export interface HistoryEntry {
  date: string;
  profileId: string;
  profileName: string;
  monthlyTotal: number;
}

const PROFILES_KEY = 'nairavolt-profiles';
const ACTIVE_KEY = 'nairavolt-active-profile';
const HISTORY_KEY = 'nairavolt-history';

const loadProfiles = (): Profile[] => {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const loadActiveId = (): string | null => {
  try { return localStorage.getItem(ACTIVE_KEY); }
  catch { return null; }
};

const loadHistory = (): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>(loadProfiles);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(loadActiveId);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);

  useEffect(() => { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => {
    if (activeProfileId) localStorage.setItem(ACTIVE_KEY, activeProfileId);
    else localStorage.removeItem(ACTIVE_KEY);
  }, [activeProfileId]);
  useEffect(() => { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }, [history]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  const createProfile = useCallback((name: string) => {
    const id = `profile-${Date.now()}`;
    const newProfile: Profile = { id, name, bandId: TARIFF_BANDS[0].id, appliances: [] };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(id);
    return newProfile;
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    setActiveProfileId(prev => prev === id ? null : prev);
  }, []);

  const renameProfile = useCallback((id: string, name: string) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  }, []);

  const switchProfile = useCallback((id: string) => {
    setActiveProfileId(id);
  }, []);

  const saveProfileState = useCallback((bandId: string, appliances: UserAppliance[]) => {
    if (!activeProfileId) return;
    setProfiles(prev => prev.map(p => {
      if (p.id !== activeProfileId) return p;
      return {
        ...p,
        bandId,
        appliances: appliances.map(ua => ({
          applianceId: ua.appliance.id,
          applianceName: ua.appliance.name,
          applianceWatts: ua.appliance.average_watts,
          applianceIcon: ua.appliance.icon,
          applianceTip: ua.appliance.wise_usage,
          hoursPerDay: ua.hoursPerDay,
          quantity: ua.quantity,
        })),
      };
    }));
  }, [activeProfileId]);

  const snapshotHistory = useCallback((profileId: string, profileName: string, monthlyTotal: number) => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setHistory(prev => {
      const filtered = prev.filter(h => !(h.date === date && h.profileId === profileId));
      return [...filtered, { date, profileId, profileName, monthlyTotal }].sort((a, b) => a.date.localeCompare(b.date));
    });
  }, []);

  return {
    profiles,
    activeProfile,
    activeProfileId,
    history,
    createProfile,
    deleteProfile,
    renameProfile,
    switchProfile,
    saveProfileState,
    snapshotHistory,
  };
};
