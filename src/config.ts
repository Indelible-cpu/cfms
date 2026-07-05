import { useEffect, useState } from 'react';

export const defaultForestName = 'Community Forest Management System';
const forestNameStorageKey = 'cfms-forest-name';

export const getStoredForestName = () => {
  if (typeof window === 'undefined') {
    return defaultForestName;
  }

  const stored = window.localStorage.getItem(forestNameStorageKey);
  return (stored && stored.trim()) || defaultForestName;
};

export const setStoredForestName = (value: string) => {
  const nextName = value.trim() || defaultForestName;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(forestNameStorageKey, nextName);
    window.dispatchEvent(new Event('cfms-forest-name-changed'));
  }
  return nextName;
};

export const useForestName = () => {
  const [forestName, setForestName] = useState(getStoredForestName);

  useEffect(() => {
    const handleChange = () => setForestName(getStoredForestName());
    window.addEventListener('cfms-forest-name-changed', handleChange);
    return () => window.removeEventListener('cfms-forest-name-changed', handleChange);
  }, []);

  return forestName;
};
