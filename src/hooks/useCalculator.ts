import { useState, useMemo, useCallback } from 'react';
import { TARIFF_BANDS, type TariffBand, type Appliance, type UserAppliance } from '@/data/appliances';

const calculateMonthly = (watts: number, hours: number, rate: number) => {
  const kwh = (watts / 1000) * hours;
  return kwh * rate * 30;
};

export const useCalculator = () => {
  const [selectedBand, setSelectedBand] = useState<TariffBand>(TARIFF_BANDS[0]);
  const [userAppliances, setUserAppliances] = useState<UserAppliance[]>([]);

  const addAppliance = useCallback((appliance: Appliance) => {
    setUserAppliances(prev => {
      if (prev.some(ua => ua.appliance.id === appliance.id)) return prev;
      const cost = calculateMonthly(appliance.average_watts, 1, selectedBand.rate);
      return [...prev, { appliance, hoursPerDay: 1, monthlyCost: cost }];
    });
  }, [selectedBand]);

  const updateHours = useCallback((applianceId: string, hours: number) => {
    setUserAppliances(prev =>
      prev.map(ua =>
        ua.appliance.id === applianceId
          ? { ...ua, hoursPerDay: hours, monthlyCost: calculateMonthly(ua.appliance.average_watts, hours, selectedBand.rate) }
          : ua
      )
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
        return {
          ...ua,
          hoursPerDay: clampedHours,
          monthlyCost: calculateMonthly(ua.appliance.average_watts, clampedHours, band.rate),
        };
      })
    );
  }, []);

  const totalMonthly = useMemo(
    () => userAppliances.reduce((sum, ua) => sum + ua.monthlyCost, 0),
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
    addAppliance,
    updateHours,
    removeAppliance,
    changeBand,
    isHeavyHitter,
  };
};
