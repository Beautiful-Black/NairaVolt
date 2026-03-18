import { useState, useMemo, useCallback } from 'react';
import { TARIFF_BANDS, type TariffBand, type Appliance, type UserAppliance } from '@/data/appliances';

const calculateDaily = (watts: number, hours: number, rate: number) => {
  return (watts * hours * rate) / 1000;
};

export const useCalculator = () => {
  const [selectedBand, setSelectedBand] = useState<TariffBand>(TARIFF_BANDS[0]);
  const [userAppliances, setUserAppliances] = useState<UserAppliance[]>([]);

  const addAppliance = useCallback((appliance: Appliance) => {
    setUserAppliances(prev => {
      if (prev.some(ua => ua.appliance.id === appliance.id)) return prev;
      const daily = calculateDaily(appliance.average_watts, 1, selectedBand.rate);
      return [...prev, { appliance, hoursPerDay: 1, dailyCost: daily, monthlyCost: daily * 30 }];
    });
  }, [selectedBand]);

  const updateHours = useCallback((applianceId: string, hours: number) => {
    setUserAppliances(prev =>
      prev.map(ua => {
        if (ua.appliance.id !== applianceId) return ua;
        const daily = calculateDaily(ua.appliance.average_watts, hours, selectedBand.rate);
        return { ...ua, hoursPerDay: hours, dailyCost: daily, monthlyCost: daily * 30 };
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
        const daily = calculateDaily(ua.appliance.average_watts, clampedHours, band.rate);
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
    removeAppliance,
    changeBand,
    isHeavyHitter,
  };
};
