import { create } from 'zustand';
import type { UserProfile } from '../types';
import { auth, googleProvider, db } from '../lib/firebase';
import { saveUserProfileToFirebase } from '../services/firebaseService';
import {

  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  type User
} from '@firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthState {
  user: UserProfile | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isGuest: boolean;
  error: string | null;
  phoneConfirmationResult: ConfirmationResult | null;
  phoneLoginsTodayCount: number;

  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  sendPhoneOtp: (phoneNumber: string, recaptchaContainerId: string) => Promise<boolean>;
  verifyPhoneOtp: (code: string) => Promise<void>;
  enableGuestMode: () => void;
  clearError: () => void;
  signOut: () => Promise<void>;
  initializeAuth: () => () => void;
}

// Helpers for tracking 10 phone users/day limit
async function getTodayPhoneLoginCount(): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(db, `stats/phone_logins_${today}`);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().count || 0;
    }
    return 0;
  } catch (err) {
    return 0;
  }
}

async function incrementTodayPhoneLoginCount(): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(db, `stats/phone_logins_${today}`);
    const snap = await getDoc(docRef);
    const currentCount = snap.exists() ? (snap.data().count || 0) : 0;
    await setDoc(docRef, { count: currentCount + 1, date: today }, { merge: true });
  } catch (err) {
    console.warn('Failed to increment phone login count:', err);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  isLoading: true,
  isGuest: false,
  error: null,
  phoneConfirmationResult: null,
  phoneLoginsTodayCount: 0,

  clearError: () => set({ error: null }),

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
      await saveUserProfileToFirebase(userProfile);
      set({ user: userProfile, firebaseUser: user, isGuest: false, isLoading: false });
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      set({ error: err.message || 'Failed to sign in with Google', isLoading: false });
    }
  },

  signUpWithEmail: async (email: string, pass: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
        const userProfile: UserProfile = {
          uid: res.user.uid,
          name: name || 'Athlete',
          email: res.user.email || email,
          units: 'kg',
          currentProgramId: 'ppl-6-day-advanced',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveUserProfileToFirebase(userProfile);
        set({ user: userProfile, firebaseUser: res.user, isGuest: false, isLoading: false });
      }
    } catch (err: any) {
      console.error('Email Sign Up Error:', err);
      let msg = 'Failed to create account. Check your details.';
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered. Try signing in.';
      if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
      set({ error: msg, isLoading: false });
    }
  },

  signInWithEmail: async (email: string, pass: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        const userProfile: UserProfile = {
          uid: res.user.uid,
          name: res.user.displayName || email.split('@')[0] || 'Athlete',
          email: res.user.email || email,
          units: 'kg',
          currentProgramId: 'ppl-6-day-advanced',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveUserProfileToFirebase(userProfile);
        set({ user: userProfile, firebaseUser: res.user, isGuest: false, isLoading: false });
      }
    } catch (err: any) {
      console.error('Email Sign In Error:', err);
      let msg = 'Invalid email or password.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid username/email or password.';
      }
      set({ error: msg, isLoading: false });
    }
  },

  sendPhoneOtp: async (phoneNumber: string, recaptchaContainerId: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    // Check 10 phone logins per day quota limit
    const todayCount = await getTodayPhoneLoginCount();
    set({ phoneLoginsTodayCount: todayCount });

    if (todayCount >= 10) {
      set({
        error: 'Currently the service is not available try someother login way',
        isLoading: false
      });
      return false;
    }

    try {
      let appVerifier = (window as any).recaptchaVerifier;
      if (!appVerifier) {
        appVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
          size: 'invisible',
          callback: () => {}
        });
        (window as any).recaptchaVerifier = appVerifier;
      }

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      set({ phoneConfirmationResult: confirmationResult, isLoading: false });
      return true;
    } catch (err: any) {
      console.error('Phone Auth Error:', err);
      let msg = 'Currently the service is not available try someother login way';
      if (err.code === 'auth/quota-exceeded' || err.code === 'auth/too-many-requests' || err.code === 'auth/resource-exhausted') {
        msg = 'Currently the service is not available try someother login way';
      }
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  verifyPhoneOtp: async (code: string) => {
    const { phoneConfirmationResult } = get();
    if (!phoneConfirmationResult) {
      set({ error: 'Session expired. Please request a new OTP code.' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await phoneConfirmationResult.confirm(code);
      if (res.user) {
        await incrementTodayPhoneLoginCount();
        const userProfile: UserProfile = {
          uid: res.user.uid,
          name: res.user.displayName || res.user.phoneNumber || 'Athlete',
          email: res.user.email || '',
          units: 'kg',
          currentProgramId: 'ppl-6-day-advanced',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveUserProfileToFirebase(userProfile);
        set({ user: userProfile, firebaseUser: res.user, isGuest: false, isLoading: false, phoneConfirmationResult: null });
      }
    } catch (err: any) {
      console.error('Verify OTP Error:', err);
      set({
        error: 'Currently the service is not available try someother login way',
        isLoading: false
      });
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const userProfile: UserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || firebaseUser.phoneNumber || 'Athlete',
          email: firebaseUser.email || '',
          units: 'kg',
          currentProgramId: 'ppl-6-day-advanced',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveUserProfileToFirebase(userProfile);
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



