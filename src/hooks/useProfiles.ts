import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

const HISTORY_KEY = 'nairavolt-history';
const ACTIVE_KEY = 'nairavolt-active-profile';

const loadHistory = (): HistoryEntry[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const useProfiles = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    try { return localStorage.getItem(ACTIVE_KEY); } catch { return null; }
  });
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [loaded, setLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist active profile id & history to localStorage
  useEffect(() => {
    if (activeProfileId) localStorage.setItem(ACTIVE_KEY, activeProfileId);
    else localStorage.removeItem(ACTIVE_KEY);
  }, [activeProfileId]);
  useEffect(() => { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }, [history]);

  // ─── Fetch profiles + appliances from DB ───
  const fetchProfiles = useCallback(async () => {
    if (!user) { setProfiles([]); setLoaded(true); return; }

    const { data: profileRows } = await supabase
      .from('profiles_data')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (!profileRows || profileRows.length === 0) {
      setProfiles([]);
      setLoaded(true);
      return;
    }

    const profileIds = profileRows.map((p: any) => p.id);
    const { data: appRows } = await supabase
      .from('profile_appliances')
      .select('*')
      .in('profile_id', profileIds);

    const appsByProfile: Record<string, Profile['appliances']> = {};
    (appRows || []).forEach((a: any) => {
      if (!appsByProfile[a.profile_id]) appsByProfile[a.profile_id] = [];
      appsByProfile[a.profile_id].push({
        applianceId: a.appliance_id,
        applianceName: a.appliance_name,
        applianceWatts: a.appliance_watts,
        applianceIcon: a.appliance_icon,
        applianceTip: a.appliance_tip,
        hoursPerDay: a.hours_per_day,
        quantity: a.quantity,
      });
    });

    const loaded: Profile[] = profileRows.map((p: any) => ({
      id: p.id,
      name: p.name,
      bandId: p.band_id,
      appliances: appsByProfile[p.id] || [],
    }));

    setProfiles(loaded);
    // If saved active id isn't in the list, pick first
    if (!loaded.find(p => p.id === activeProfileId)) {
      setActiveProfileId(loaded[0]?.id || null);
    }
    setLoaded(true);
  }, [user]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  // ─── Create ───
  const createProfile = useCallback(async (name: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('profiles_data')
      .insert({ user_id: user.id, name, band_id: TARIFF_BANDS[0].id })
      .select()
      .single();
    if (error || !data) return null;
    const newProfile: Profile = { id: data.id, name: data.name, bandId: data.band_id, appliances: [] };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(data.id);
    return newProfile;
  }, [user]);

  // ─── Delete ───
  const deleteProfile = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('profiles_data').delete().eq('id', id).eq('user_id', user.id);
    setProfiles(prev => prev.filter(p => p.id !== id));
    setActiveProfileId(prev => prev === id ? null : prev);
  }, [user]);

  // ─── Rename ───
  const renameProfile = useCallback(async (id: string, name: string) => {
    if (!user) return;
    await supabase.from('profiles_data').update({ name }).eq('id', id).eq('user_id', user.id);
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  }, [user]);

  // ─── Switch ───
  const switchProfile = useCallback((id: string) => {
    setActiveProfileId(id);
  }, []);

  // ─── Save profile state (debounced DB sync) ───
  const saveProfileState = useCallback((bandId: string, appliances: UserAppliance[]) => {
    if (!activeProfileId || !user) return;

    // Update local state immediately
    const appData = appliances.map(ua => ({
      applianceId: ua.appliance.id,
      applianceName: ua.appliance.name,
      applianceWatts: ua.appliance.average_watts,
      applianceIcon: ua.appliance.icon,
      applianceTip: ua.appliance.wise_usage,
      hoursPerDay: ua.hoursPerDay,
      quantity: ua.quantity,
    }));

    setProfiles(prev => prev.map(p => {
      if (p.id !== activeProfileId) return p;
      return { ...p, bandId, appliances: appData };
    }));

    // Debounce DB write
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      // Update band
      await supabase.from('profiles_data').update({ band_id: bandId }).eq('id', activeProfileId).eq('user_id', user.id);

      // Replace appliances: delete all then insert
      await supabase.from('profile_appliances').delete().eq('profile_id', activeProfileId).eq('user_id', user.id);

      if (appliances.length > 0) {
        const rows = appliances.map(ua => ({
          profile_id: activeProfileId,
          user_id: user.id,
          appliance_id: ua.appliance.id,
          appliance_name: ua.appliance.name,
          appliance_watts: ua.appliance.average_watts,
          appliance_icon: ua.appliance.icon,
          appliance_tip: ua.appliance.wise_usage,
          hours_per_day: ua.hoursPerDay,
          quantity: ua.quantity,
        }));
        await supabase.from('profile_appliances').insert(rows);
      }
    }, 800);
  }, [activeProfileId, user]);

  // ─── History snapshot (kept in localStorage for now) ───
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
    loaded,
    createProfile,
    deleteProfile,
    renameProfile,
    switchProfile,
    saveProfileState,
    snapshotHistory,
  };
};
