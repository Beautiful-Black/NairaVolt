import { useCallback, useEffect, useMemo, useState } from 'react';
import { TARIFF_BANDS } from '@/data/appliances';

export type DeliveryPreferences = {
  inApp: boolean;
  push: boolean;
  email: boolean;
};

export type AuditAppliance = {
  id: string;
  name: string;
  category: string;
  watts: number;
  quantity: number;
  hoursPerDay: number;
};

export type AuditSpace = {
  id: string;
  name: string;
  buildingId: string;
  baselineKwh: number;
  appliances: AuditAppliance[];
};

export type AuditBuilding = { id: string; name: string };

export type AuditLog = {
  id: string;
  text: string;
  kind: 'note' | 'fault' | 'check';
  createdAt: string;
};

export type AuditLocation = {
  id: string;
  name: string;
  bandId: string;
  customRate: number | null;
  buildings: AuditBuilding[];
  spaces: AuditSpace[];
  logs: AuditLog[];
  limits: { maxWatts: number; maxHours: number };
  delivery: DeliveryPreferences;
};

type StoredAudit = {
  locations: AuditLocation[];
  activeLocationId: string;
  memoryEnabled: boolean;
};

const STORAGE_KEY = 'nairavolt-manual-audit-v1';
const VAT = 1.075;

const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const appliance = (name: string, category: string, watts: number, quantity: number, hoursPerDay: number): AuditAppliance => ({
  id: id('appliance'), name, category, watts, quantity, hoursPerDay,
});

const seedLocation = (locationId: string, name: string, bandId: string, spaces: AuditSpace[]): AuditLocation => ({
  id: locationId,
  name,
  bandId,
  customRate: null,
  buildings: name === 'Home'
    ? [{ id: 'building-home', name: 'Main House' }]
    : [{ id: 'building-office', name: 'Main Office' }, { id: 'building-store', name: 'Storefront' }],
  spaces,
  logs: [],
  limits: { maxWatts: 5000, maxHours: 16 },
  delivery: { inApp: true, push: false, email: false },
});

const defaultLocations = (): AuditLocation[] => [
  seedLocation('location-home', 'Home', 'B', [
    { id: 'space-living', name: 'Living Room', buildingId: 'building-home', baselineKwh: 12, appliances: [appliance('LED TV', 'Entertainment', 50, 1, 6), appliance('Ceiling Fan', 'Cooling', 85, 1, 8)] },
    { id: 'space-kitchen', name: 'Kitchen', buildingId: 'building-home', baselineKwh: 8, appliances: [appliance('Fridge (Double Door)', 'Kitchen', 250, 1, 12), appliance('Electric Kettle', 'Kitchen', 2200, 1, 0.5)] },
  ]),
  seedLocation('location-office', 'Office', 'C', [
    { id: 'space-ict', name: 'ICT Room', buildingId: 'building-office', baselineKwh: 20, appliances: [appliance('Desktop Computers', 'Technology', 300, 8, 7), appliance('Air Conditioner (1HP)', 'Cooling', 750, 1, 6)] },
    { id: 'space-reception', name: 'Reception', buildingId: 'building-office', baselineKwh: 6, appliances: [appliance('LED Bulbs', 'Lighting', 10, 6, 9), appliance('Standing Fan', 'Cooling', 75, 1, 8)] },
    { id: 'space-store', name: 'Store 1', buildingId: 'building-store', baselineKwh: 4, appliances: [appliance('Security Camera', 'Security', 15, 2, 12)] },
  ]),
];

const readStored = (): StoredAudit | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAudit;
    if (!Array.isArray(parsed.locations) || parsed.locations.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
};

const tariffRate = (location: AuditLocation) => location.customRate ?? TARIFF_BANDS.find(band => band.id === location.bandId)?.rate ?? TARIFF_BANDS[0].rate;

export const getLocationMetrics = (location: AuditLocation) => {
  const rate = tariffRate(location);
  const rows = location.spaces.flatMap(space => space.appliances.map(item => {
    const dailyKwh = (item.watts * item.quantity * item.hoursPerDay) / 1000;
    const dailyCost = dailyKwh * rate * VAT;
    return { ...item, spaceId: space.id, spaceName: space.name, buildingId: space.buildingId, dailyKwh, monthlyKwh: dailyKwh * 30, dailyCost, monthlyCost: dailyCost * 30 };
  }));
  const totalDailyKwh = rows.reduce((sum, row) => sum + row.dailyKwh, 0);
  const totalMonthlyKwh = totalDailyKwh * 30;
  const totalDailyCost = rows.reduce((sum, row) => sum + row.dailyCost, 0);
  const totalMonthlyCost = totalDailyCost * 30;
  const spaceTotals = location.spaces.map(space => ({ ...space, monthlyKwh: rows.filter(row => row.spaceId === space.id).reduce((sum, row) => sum + row.monthlyKwh, 0), monthlyCost: rows.filter(row => row.spaceId === space.id).reduce((sum, row) => sum + row.monthlyCost, 0) }));
  const topSpace = [...spaceTotals].sort((a, b) => b.monthlyKwh - a.monthlyKwh)[0];
  const topAppliance = [...rows].sort((a, b) => b.monthlyKwh - a.monthlyKwh)[0];
  const alerts = rows.flatMap(row => {
    const items = [];
    if (row.watts * row.quantity > location.limits.maxWatts) items.push({ id: `watts-${row.id}`, severity: 'warning' as const, title: `${row.spaceName}: wattage limit exceeded`, detail: `${row.name} is drawing ${(row.watts * row.quantity).toLocaleString()}W against the ${location.limits.maxWatts.toLocaleString()}W limit.` });
    if (row.hoursPerDay > location.limits.maxHours) items.push({ id: `hours-${row.id}`, severity: 'warning' as const, title: `${row.spaceName}: operating hours need review`, detail: `${row.name} is set to ${row.hoursPerDay} hours/day against the ${location.limits.maxHours}-hour limit.` });
    return items;
  });
  location.spaces.forEach(space => {
    const spaceKwh = spaceTotals.find(item => item.id === space.id)?.monthlyKwh ?? 0;
    if (spaceKwh > space.baselineKwh * 30) alerts.push({ id: `baseline-${space.id}`, severity: 'info' as const, title: `${space.name} exceeds its baseline`, detail: `${spaceKwh.toFixed(1)} kWh/month is above the ${space.baselineKwh * 30} kWh planning baseline.` });
  });
  return { rate, rows, totalDailyKwh, totalMonthlyKwh, totalDailyCost, totalMonthlyCost, totalAnnualKwh: totalMonthlyKwh * 12, totalAnnualCost: totalMonthlyCost * 12, spaceTotals, topSpace, topAppliance, alerts };
};

export const useManualAudit = () => {
  const [memoryEnabled, setMemoryEnabled] = useState(() => {
    try { return localStorage.getItem(`${STORAGE_KEY}-memory`) !== 'off'; } catch { return true; }
  });
  const [locations, setLocations] = useState<AuditLocation[]>(() => readStored()?.locations ?? defaultLocations());
  const [activeLocationId, setActiveLocationId] = useState(() => readStored()?.activeLocationId ?? 'location-home');
  const activeLocation = locations.find(location => location.id === activeLocationId) ?? locations[0];

  useEffect(() => {
    if (!memoryEnabled) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(`${STORAGE_KEY}-memory`, 'off');
      return;
    }
    localStorage.setItem(`${STORAGE_KEY}-memory`, 'on');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ locations, activeLocationId, memoryEnabled: true } satisfies StoredAudit));
  }, [locations, activeLocationId, memoryEnabled]);

  const updateLocation = useCallback((locationId: string, update: (location: AuditLocation) => AuditLocation) => {
    setLocations(current => current.map(location => location.id === locationId ? update(location) : location));
  }, []);
  const createLocation = useCallback((name: string) => {
    const location: AuditLocation = { ...seedLocation(id('location'), name, 'B', []), buildings: [{ id: id('building'), name: 'Main Building' }] };
    setLocations(current => [...current, location]);
    setActiveLocationId(location.id);
  }, []);
  const renameLocation = useCallback((locationId: string, name: string) => updateLocation(locationId, location => ({ ...location, name })), [updateLocation]);
  const deleteLocation = useCallback((locationId: string) => {
    setLocations(current => {
      if (current.length <= 1) return current;
      const next = current.filter(location => location.id !== locationId);
      if (locationId === activeLocationId) setActiveLocationId(next[0]?.id ?? '');
      return next;
    });
  }, [activeLocationId]);
  const addBuilding = useCallback((name: string) => {
    if (!activeLocation) return;
    updateLocation(activeLocation.id, location => ({ ...location, buildings: [...location.buildings, { id: id('building'), name }] }));
  }, [activeLocation, updateLocation]);
  const addSpace = useCallback((name: string, buildingId: string) => {
    if (!activeLocation) return;
    updateLocation(activeLocation.id, location => ({ ...location, spaces: [...location.spaces, { id: id('space'), name, buildingId, baselineKwh: 10, appliances: [] }] }));
  }, [activeLocation, updateLocation]);
  const updateSpace = useCallback((spaceId: string, update: Partial<AuditSpace>) => {
    if (!activeLocation) return;
    updateLocation(activeLocation.id, location => ({ ...location, spaces: location.spaces.map(space => space.id === spaceId ? { ...space, ...update } : space) }));
  }, [activeLocation, updateLocation]);
  const deleteSpace = useCallback((spaceId: string) => {
    if (!activeLocation) return;
    updateLocation(activeLocation.id, location => ({ ...location, spaces: location.spaces.filter(space => space.id !== spaceId) }));
  }, [activeLocation, updateLocation]);
  const addAppliance = useCallback((spaceId: string, item: Omit<AuditAppliance, 'id'>) => {
    if (!activeLocation) return;
    updateLocation(activeLocation.id, location => ({ ...location, spaces: location.spaces.map(space => space.id === spaceId ? { ...space, appliances: [...space.appliances, { ...item, id: id('appliance') }] } : space) }));
  }, [activeLocation, updateLocation]);
  const updateAppliance = useCallback((spaceId: string, applianceId: string, update: Partial<AuditAppliance>) => {
    if (!activeLocation) return;
    updateLocation(activeLocation.id, location => ({ ...location, spaces: location.spaces.map(space => space.id === spaceId ? { ...space, appliances: space.appliances.map(item => item.id === applianceId ? { ...item, ...update } : item) } : space) }));
  }, [activeLocation, updateLocation]);
  const deleteAppliance = useCallback((spaceId: string, applianceId: string) => {
    if (!activeLocation) return;
    updateLocation(activeLocation.id, location => ({ ...location, spaces: location.spaces.map(space => space.id === spaceId ? { ...space, appliances: space.appliances.filter(item => item.id !== applianceId) } : space) }));
  }, [activeLocation, updateLocation]);
  const updateSettings = useCallback((update: Partial<Pick<AuditLocation, 'bandId' | 'customRate' | 'limits' | 'delivery'>>) => {
    if (!activeLocation) return;
    updateLocation(activeLocation.id, location => ({ ...location, ...update }));
  }, [activeLocation, updateLocation]);
  const addLog = useCallback((text: string, kind: AuditLog['kind']) => {
    if (!activeLocation) return;
    updateLocation(activeLocation.id, location => ({ ...location, logs: [{ id: id('log'), text, kind, createdAt: new Date().toISOString() }, ...location.logs] }));
  }, [activeLocation, updateLocation]);
  const clearSavedData = useCallback(() => {
    const seeded = defaultLocations();
    setLocations(seeded);
    setActiveLocationId(seeded[0].id);
    localStorage.removeItem(STORAGE_KEY);
  }, []);
  const toggleMemory = useCallback((enabled: boolean) => {
    setMemoryEnabled(enabled);
    if (!enabled) localStorage.removeItem(STORAGE_KEY);
  }, []);

  const allMetrics = useMemo(() => locations.map(location => ({ location, metrics: getLocationMetrics(location) })), [locations]);
  return { locations, activeLocation, activeLocationId, setActiveLocationId, memoryEnabled, toggleMemory, createLocation, renameLocation, deleteLocation, addBuilding, addSpace, updateSpace, deleteSpace, addAppliance, updateAppliance, deleteAppliance, updateSettings, addLog, clearSavedData, metrics: activeLocation ? getLocationMetrics(activeLocation) : null, allMetrics };
};