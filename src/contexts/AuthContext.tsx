import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
} from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';

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

const toEmail = (username: string): string => {
  const trimmed = username.trim();
  if (!trimmed) return trimmed;
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
          const snapshot = await get(ref(db, `users/${nextUser.uid}`));
          if (snapshot.exists()) {
            setProfile(snapshot.val() as UserProfile);
          } else {
            // New user — default to Community Member until assigned a role
            setProfile({
              uid: nextUser.uid,
              role: 'Community Member',
              name: nextUser.displayName || nextUser.email || 'Community Member',
              email: nextUser.email || undefined,
            });
          }
        } catch {
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

  const login = (username: string, password: string) =>
    signInWithEmailAndPassword(auth, toEmail(username), password);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const resetPassword = (username: string) =>
    sendPasswordResetEmail(auth, toEmail(username));

  const changePassword = async (password: string) => {
    if (!auth.currentUser) throw new Error('No signed-in user.');
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
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
