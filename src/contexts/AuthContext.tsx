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
  login: (email: string, password: string) => Promise<unknown>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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

  const login = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };
  const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);
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
