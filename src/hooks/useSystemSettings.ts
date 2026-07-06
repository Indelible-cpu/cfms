import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { defaultForestName } from '../config';

interface SystemSettings {
  forestName: string;
  logo: string;
  loading: boolean;
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    forestName: defaultForestName,
    logo: '',
    loading: true,
  });

  useEffect(() => {
    const settingsRef = ref(db, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setSettings({
          forestName: data.forestName || defaultForestName,
          logo: data.logo || '',
          loading: false,
        });
      } else {
        setSettings((prev) => ({ ...prev, loading: false }));
      }
    }, (error) => {
      console.error("Error fetching system settings:", error);
      setSettings((prev) => ({ ...prev, loading: false }));
    });

    return () => unsubscribe();
  }, []);

  return settings;
}
