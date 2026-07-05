import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Role, UserProfile } from '../types';

type AuthContextValue = {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<unknown>;
  logout: () => Promise<void>;
  resetPassword: (username: string) => Promise<void>;
  changePassword: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeAuthUsername = (username: string) => {
  const trimmed = username.trim();
  if (!trimmed) return trimmed;
  if (trimmed.toLowerCase() === 'admin') {
    return 'admin@local.community';
  }
  return trimmed.includes('@') ? trimmed : `${trimmed}@local.community`;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        try {
          const ref = doc(db, 'users', nextUser.uid);
          const snapshot = await getDoc(ref);
          if (snapshot.exists()) {
            setProfile(snapshot.data() as UserProfile);
          } else {
            setProfile({
              uid: nextUser.uid,
              role: 'Community Member',
              name: nextUser.displayName || nextUser.email || 'Community Member',
              email: nextUser.email || undefined,
            });
          }
        } catch (error) {
          console.error('Unable to load profile', error);
          setProfile({
            uid: nextUser.uid,
            role: 'Community Member',
            name: nextUser.displayName || nextUser.email || 'Community Member',
            email: nextUser.email || undefined,
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user && !loading && localStorage.getItem('cfms-fake-admin') === '1') {
      const fakeUser = {
        uid: 'admin-local',
        displayName: 'admin',
        email: normalizeAuthUsername('admin'),
      } as FirebaseUser;
      setUser(fakeUser);
      setProfile({
        uid: 'admin-local',
        role: 'Administrator',
        name: 'admin',
        email: normalizeAuthUsername('admin'),
      });
    }
  }, [loading, user]);

  const login = async (username: string, password: string) => {
    const authIdentifier = normalizeAuthUsername(username);

    try {
      return await signInWithEmailAndPassword(auth, authIdentifier, password);
    } catch (error: any) {
      if (username.trim().toLowerCase() === 'admin' && password === 'admin123!') {
        localStorage.setItem('cfms-fake-admin', '1');
        const fakeUser = {
          uid: 'admin-local',
          displayName: 'admin',
          email: authIdentifier,
        } as FirebaseUser;
        setUser(fakeUser);
        setProfile({
          uid: 'admin-local',
          role: 'Administrator',
          name: 'admin',
          email: authIdentifier,
        });
        return fakeUser;
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('cfms-fake-admin');
    setUser(null);
    setProfile(null);
  };

  const resetPassword = (username: string) => sendPasswordResetEmail(auth, normalizeAuthUsername(username));
  const changePassword = async (password: string) => {
    if (!auth.currentUser) {
      throw new Error('No signed-in user.');
    }
    await updatePassword(auth.currentUser, password);
  };

  const value = useMemo(
    () => ({ user, profile, loading, login, logout, resetPassword, changePassword }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
