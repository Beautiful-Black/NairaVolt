import { useState, useMemo, useCallback, useEffect } from 'react';
import { TARIFF_BANDS, APPLIANCES, type TariffBand, type Appliance, type UserAppliance } from '@/data/appliances';
import { type Profile } from '@/hooks/useProfiles';

const calculateDaily = (watts: number, quantity: number, hours: number, rate: number) => {
  return (watts * quantity * hours * rate) / 1000;
};

export const useCalculator = (activeProfile: Profile | null) => {
  const [selectedBand, setSelectedBand] = useState<TariffBand>(TARIFF_BANDS[0]);
  const [userAppliances, setUserAppliances] = useState<UserAppliance[]>([]);

  // Restore state from active profile
  useEffect(() => {
    if (!activeProfile) {
      setSelectedBand(TARIFF_BANDS[0]);
      setUserAppliances([]);
      return;
    }
    const band = TARIFF_BANDS.find(b => b.id === activeProfile.bandId) || TARIFF_BANDS[0];
    setSelectedBand(band);

    const restored: UserAppliance[] = activeProfile.appliances.map(pa => {
      const catalogMatch = APPLIANCES.find(a => a.id === pa.applianceId);
      const appliance: Appliance = catalogMatch || {
        id: pa.applianceId,
        name: pa.applianceName,
        average_watts: pa.applianceWatts,
        icon: pa.applianceIcon,
        wise_usage: pa.applianceTip,
      };
      const hours = Math.min(pa.hoursPerDay, band.supplyHours);
      const qty = pa.quantity || 1;
      const daily = calculateDaily(appliance.average_watts, qty, hours, band.rate);
      return { appliance, quantity: qty, hoursPerDay: hours, dailyCost: daily, monthlyCost: daily * 30 };
    });
    setUserAppliances(restored);
  }, [activeProfile?.id]);

  const addAppliance = useCallback((appliance: Appliance) => {
    setUserAppliances(prev => {
      if (prev.some(ua => ua.appliance.id === appliance.id)) return prev;
      const daily = calculateDaily(appliance.average_watts, 1, 1, selectedBand.rate);
      return [...prev, { appliance, quantity: 1, hoursPerDay: 1, dailyCost: daily, monthlyCost: daily * 30 }];
    });
  }, [selectedBand]);

  const updateHours = useCallback((applianceId: string, hours: number) => {
    setUserAppliances(prev =>
      prev.map(ua => {
        if (ua.appliance.id !== applianceId) return ua;
        const daily = calculateDaily(ua.appliance.average_watts, ua.quantity, hours, selectedBand.rate);
        return { ...ua, hoursPerDay: hours, dailyCost: daily, monthlyCost: daily * 30 };
      })
    );
  }, [selectedBand]);

  const updateQuantity = useCallback((applianceId: string, quantity: number) => {
    setUserAppliances(prev =>
      prev.map(ua => {
        if (ua.appliance.id !== applianceId) return ua;
        const qty = Math.max(1, Math.min(20, quantity));
        const daily = calculateDaily(ua.appliance.average_watts, qty, ua.hoursPerDay, selectedBand.rate);
        return { ...ua, quantity: qty, dailyCost: daily, monthlyCost: daily * 30 };
      })
    );
  }, [selectedBand]);

  const removeAppliance = useCallback((applianceId: string) => {
    setUserAppliances(prev => prev.filter(ua => ua.appliance.id !== applianceId));
  }, []);

  const changeBand = useCallback((band: TariffBand) => {
    setSelectedBand(band);
    setUserAppliances(prev =>
      prev.map(ua => {
        const clampedHours = Math.min(ua.hoursPerDay, band.supplyHours);
        const daily = calculateDaily(ua.appliance.average_watts, ua.quantity, clampedHours, band.rate);
        return { ...ua, hoursPerDay: clampedHours, dailyCost: daily, monthlyCost: daily * 30 };
      })
    );
  }, []);

  const totalMonthly = useMemo(
    () => userAppliances.reduce((sum, ua) => sum + ua.monthlyCost, 0),
    [userAppliances]
  );

  const totalDaily = useMemo(
    () => userAppliances.reduce((sum, ua) => sum + ua.dailyCost, 0),
    [userAppliances]
  );

  const isHeavyHitter = useCallback(
    (itemCost: number) => totalMonthly > 0 && (itemCost / totalMonthly) > 0.4,
    [totalMonthly]
  );

  return {
    selectedBand,
    userAppliances,
    totalMonthly,
    totalDaily,
    addAppliance,
    updateHours,
    updateQuantity,
    removeAppliance,
    changeBand,
    isHeavyHitter,
  };
};
