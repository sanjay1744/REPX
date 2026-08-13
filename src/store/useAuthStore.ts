import { create } from 'zustand';
import type { UserProfile } from '../types';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, type User } from 'firebase/auth';

interface AuthState {
  user: UserProfile | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isGuest: boolean;
  error: string | null;

  signInWithGoogle: () => Promise<void>;
  enableGuestMode: () => void;
  signOut: () => Promise<void>;
  initializeAuth: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUser: null,
  isLoading: true,
  isGuest: false,
  error: null,

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userProfile: UserProfile = {
        uid: user.uid,
        name: user.displayName || 'Athlete',
        email: user.email || '',
        units: 'kg',
        currentProgramId: 'ppl-6-day-advanced',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      set({ user: userProfile, firebaseUser: user, isGuest: false, isLoading: false });
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      set({ error: err.message || 'Failed to sign in with Google', isLoading: false });
    }
  },

  enableGuestMode: () => {
    const guestUser: UserProfile = {
      uid: 'guest-user-123',
      name: 'Guest Athlete',
      email: 'guest@workout.app',
      units: 'kg',
      currentProgramId: 'ppl-6-day-advanced',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set({ user: guestUser, firebaseUser: null, isGuest: true, isLoading: false, error: null });
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error(e);
    }
    set({ user: null, firebaseUser: null, isGuest: false, isLoading: false });
  },

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        const userProfile: UserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Athlete',
          email: firebaseUser.email || '',
          units: 'kg',
          currentProgramId: 'ppl-6-day-advanced',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set({ user: userProfile, firebaseUser, isGuest: false, isLoading: false });
      } else {
        const guestUser: UserProfile = {
          uid: 'guest-user-123',
          name: 'Guest Athlete',
          email: 'guest@workout.app',
          units: 'kg',
          currentProgramId: 'ppl-6-day-advanced',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set({ user: guestUser, firebaseUser: null, isGuest: true, isLoading: false });
      }
    });

    return unsubscribe;
  }
}));
