import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  QueryDocumentSnapshot,
  writeBatch
} from 'firebase/firestore';
import type { WorkoutProgram, WorkoutSession, PersonalRecord, ExerciseDefinition, UserProfile } from '../types';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import { INITIAL_PPL_PROGRAM } from '../data/pplProgramData';

// --------------------------------------------------------
// 0. USER PROFILE: Save main user document
// --------------------------------------------------------
export async function saveUserProfileToFirebase(profile: UserProfile): Promise<void> {
  if (!profile.uid || profile.uid === 'guest-user-123') return;
  try {
    const userDocRef = doc(db, `users/${profile.uid}`);
    await setDoc(userDocRef, profile, { merge: true });
  } catch (err) {
    console.error('Failed to save user profile to Firebase:', err);
  }
}


// --------------------------------------------------------
// 1. EXERCISES: Fetch & Seed Firestore
// --------------------------------------------------------
export async function getOrSeedExercises(): Promise<ExerciseDefinition[]> {
  try {
    const exercisesRef = collection(db, 'exercises');
    const snapshot = await getDocs(exercisesRef);

    if (!snapshot.empty) {
      const exercises: ExerciseDefinition[] = [];
      snapshot.forEach((docSnap: QueryDocumentSnapshot) => {
        exercises.push(docSnap.data() as ExerciseDefinition);
      });
      return exercises;
    }

    // Seed default exercise database to Firestore if collection is empty
    console.log('Seeding initial exercises to Firebase Firestore...');
    const batch = writeBatch(db);
    EXERCISE_DATABASE.forEach((ex) => {
      const exRef = doc(db, `exercises/${ex.id}`);
      batch.set(exRef, ex);
    });
    await batch.commit();

    return EXERCISE_DATABASE;
  } catch (err) {
    console.warn('Firebase exercises fetch error, using local fallback:', err);
    return EXERCISE_DATABASE;
  }
}

export async function saveCustomExerciseToFirebase(ex: ExerciseDefinition): Promise<void> {
  try {
    const exRef = doc(db, `exercises/${ex.id}`);
    await setDoc(exRef, ex);
  } catch (err) {
    console.error('Failed to save custom exercise to Firebase:', err);
  }
}

// --------------------------------------------------------
// 2. WORKOUT PROGRAMS: Fetch & Seed Firestore
// --------------------------------------------------------
export async function getOrSeedProgram(userId?: string): Promise<WorkoutProgram> {
  try {
    const programDocId = INITIAL_PPL_PROGRAM.id;
    const targetPath = userId && userId !== 'guest-user-123'
      ? `users/${userId}/programs/${programDocId}`
      : `programs/${programDocId}`;

    const snapshot = await getDocs(collection(db, userId && userId !== 'guest-user-123' ? `users/${userId}/programs` : 'programs'));

    if (!snapshot.empty) {
      const firstProg = snapshot.docs[0].data() as WorkoutProgram;
      return firstProg;
    }

    // Seed initial program to Firestore if empty
    console.log('Seeding initial workout program to Firebase Firestore...');
    const progRef = doc(db, targetPath);
    await setDoc(progRef, INITIAL_PPL_PROGRAM);

    return INITIAL_PPL_PROGRAM;
  } catch (err) {
    console.warn('Firebase program fetch error, using local fallback:', err);
    return INITIAL_PPL_PROGRAM;
  }
}

export async function saveProgramToFirebase(program: WorkoutProgram, userId?: string): Promise<void> {
  try {
    const targetPath = userId && userId !== 'guest-user-123'
      ? `users/${userId}/programs/${program.id}`
      : `programs/${program.id}`;
    const progRef = doc(db, targetPath);
    await setDoc(progRef, program);
  } catch (err) {
    console.error('Failed to save program to Firebase:', err);
  }
}

// --------------------------------------------------------
// 3. WORKOUT SESSIONS (HISTORY): Fetch & Save
// --------------------------------------------------------
export async function fetchUserSessionsFromFirebase(userId: string): Promise<WorkoutSession[]> {
  if (!userId || userId === 'guest-user-123') return [];
  try {
    const sessionsRef = collection(db, `users/${userId}/sessions`);
    const q = query(sessionsRef, orderBy('startedAt', 'desc'));
    const snapshot = await getDocs(q);

    const sessions: WorkoutSession[] = [];
    snapshot.forEach((docSnap: QueryDocumentSnapshot) => {
      sessions.push(docSnap.data() as WorkoutSession);
    });
    return sessions;
  } catch (err) {
    console.warn('Firebase sessions fetch error:', err);
    return [];
  }
}

export async function saveSessionToFirebase(userId: string, session: WorkoutSession): Promise<void> {
  if (!userId || userId === 'guest-user-123') return;
  try {
    const sessionRef = doc(db, `users/${userId}/sessions/${session.id}`);
    await setDoc(sessionRef, session);
  } catch (err) {
    console.error('Failed to save session to Firebase:', err);
  }
}

// --------------------------------------------------------
// 4. PERSONAL RECORDS: Fetch & Save
// --------------------------------------------------------
export async function fetchUserPRsFromFirebase(userId: string): Promise<PersonalRecord[]> {
  if (!userId || userId === 'guest-user-123') return [];
  try {
    const prsRef = collection(db, `users/${userId}/prs`);
    const snapshot = await getDocs(prsRef);

    const prs: PersonalRecord[] = [];
    snapshot.forEach((docSnap: QueryDocumentSnapshot) => {
      prs.push(docSnap.data() as PersonalRecord);
    });
    return prs;
  } catch (err) {
    console.warn('Firebase PRs fetch error:', err);
    return [];
  }
}

export async function savePRToFirebase(userId: string, pr: PersonalRecord): Promise<void> {
  if (!userId || userId === 'guest-user-123') return;
  try {
    const prRef = doc(db, `users/${userId}/prs/${pr.id}`);
    await setDoc(prRef, pr);
  } catch (err) {
    console.error('Failed to save PR to Firebase:', err);
  }
}
