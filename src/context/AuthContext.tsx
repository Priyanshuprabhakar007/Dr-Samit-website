/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isOwner: boolean;
  loading: boolean;
  authError: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Primary Practice Owner Email
export const OWNER_EMAIL = 'dilseinvite@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkAdminPrivileges = async (currentUser: User) => {
    try {
      const isOwnerAccount = currentUser.emailVerified && currentUser.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

      // 1. Check custom claims on token
      const idTokenResult = await currentUser.getIdTokenResult();
      const hasAdminClaim = idTokenResult.claims.admin === true;

      // 2. Call server-side verification endpoint
      try {
        const idToken = await currentUser.getIdToken();
        const verifyRes = await fetch('/api/auth/verify-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ email: currentUser.email, uid: currentUser.uid }),
        });

        if (verifyRes.ok) {
          const authData = await verifyRes.json();
          if (authData.isAdmin) {
            setIsAdmin(true);
            setIsOwner(authData.isOwner);
            return;
          }
        }
      } catch (endpointErr) {
        console.warn('Server admin endpoint notice (falling back to database record):', endpointErr);
      }

      // 3. Check /admins/{uid} in Firestore
      const adminDocRef = doc(db, 'admins', currentUser.uid);
      const adminSnap = await getDoc(adminDocRef);

      if (isOwnerAccount) {
        // Bootstrap owner record if not yet created
        if (!adminSnap.exists()) {
          try {
            await setDoc(adminDocRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || 'Practice Owner',
              role: 'owner',
              createdAt: new Date().toISOString(),
            });
          } catch (writeErr) {
            console.warn('Owner bootstrap write notice:', writeErr);
          }
        }
        setIsAdmin(true);
        setIsOwner(true);
        return;
      }

      if (hasAdminClaim) {
        setIsAdmin(true);
        setIsOwner(false);
        return;
      }

      if (adminSnap.exists()) {
        const data = adminSnap.data();
        if (data.role === 'admin' || data.role === 'owner') {
          setIsAdmin(true);
          setIsOwner(data.role === 'owner');
          return;
        }
      }

      // Explicitly unauthorized for non-admin accounts
      setIsAdmin(false);
      setIsOwner(false);
    } catch (err: any) {
      console.error('Error verifying admin authorization:', err);
      // Authorization errors must fail closed.
      setIsAdmin(false);
      setIsOwner(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await checkAdminPrivileges(currentUser);
      } else {
        setIsAdmin(false);
        setIsOwner(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await checkAdminPrivileges(result.user);
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      setIsOwner(false);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isOwner,
        loading,
        authError,
        loginWithGoogle,
        logout,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
