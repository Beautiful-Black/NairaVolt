import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Appliance } from '@/data/appliances';

export const useCustomAppliances = () => {
  const { user } = useAuth();
  const [customAppliances, setCustomAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomAppliances = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('custom_appliances')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCustomAppliances(
        data.map((row: any) => ({
          id: `custom-${row.id}`,
          name: row.name,
          average_watts: row.average_watts,
          icon: row.icon,
          wise_usage: row.wise_usage,
        }))
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCustomAppliances();
  }, [fetchCustomAppliances]);

  const addCustomAppliance = useCallback(async (name: string, watts: number): Promise<Appliance | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('custom_appliances')
      .insert({ user_id: user.id, name, average_watts: watts })
      .select()
      .single();

    if (error || !data) return null;

    const appliance: Appliance = {
      id: `custom-${data.id}`,
      name: data.name,
      average_watts: data.average_watts,
      icon: data.icon,
      wise_usage: data.wise_usage,
    };
    setCustomAppliances(prev => [appliance, ...prev]);
    return appliance;
  }, [user]);

  const deleteCustomAppliance = useCallback(async (applianceId: string) => {
    if (!user) return;
    const dbId = applianceId.replace('custom-', '');
    await supabase.from('custom_appliances').delete().eq('id', dbId).eq('user_id', user.id);
    setCustomAppliances(prev => prev.filter(a => a.id !== applianceId));
  }, [user]);

  return { customAppliances, loading, addCustomAppliance, deleteCustomAppliance, refetch: fetchCustomAppliances };
};
