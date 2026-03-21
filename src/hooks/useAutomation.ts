import { useState, useEffect, useCallback } from 'react';

const AUTOMATION_KEY = 'nairavolt-automation';
const LAST_VISIT_KEY = 'nairavolt-last-visit';

interface AutomationState {
  [profileId: string]: boolean;
}

export const useAutomation = () => {
  const [automationState, setAutomationState] = useState<AutomationState>(() => {
    try {
      const raw = localStorage.getItem(AUTOMATION_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const [lastVisit, setLastVisit] = useState<Date | null>(() => {
    try {
      const raw = localStorage.getItem(LAST_VISIT_KEY);
      return raw ? new Date(raw) : null;
    } catch { return null; }
  });

  const [missedDay, setMissedDay] = useState(false);
  const [missedDayDismissed, setMissedDayDismissed] = useState(false);

  // Check if user was away 24+ hours
  useEffect(() => {
    if (lastVisit) {
      const hoursSince = (Date.now() - lastVisit.getTime()) / (1000 * 60 * 60);
      if (hoursSince >= 24) {
        setMissedDay(true);
      }
    }
    // Update last visit to now
    const now = new Date().toISOString();
    localStorage.setItem(LAST_VISIT_KEY, now);
    setLastVisit(new Date(now));
  }, []);

  // Persist automation state
  useEffect(() => {
    localStorage.setItem(AUTOMATION_KEY, JSON.stringify(automationState));
  }, [automationState]);

  const isAutomated = useCallback((profileId: string | null) => {
    if (!profileId) return false;
    return automationState[profileId] ?? false;
  }, [automationState]);

  const toggleAutomation = useCallback((profileId: string) => {
    setAutomationState(prev => ({
      ...prev,
      [profileId]: !prev[profileId],
    }));
  }, []);

  const dismissMissedDay = useCallback(() => {
    setMissedDayDismissed(true);
  }, []);

  const showMissedBanner = missedDay && !missedDayDismissed;

  return {
    isAutomated,
    toggleAutomation,
    showMissedBanner,
    dismissMissedDay,
  };
};
