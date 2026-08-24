import { create } from 'zustand';
import type { WorkoutProgram, WorkoutSession, PersonalRecord, BodyMetric, WorkoutDay, SetLog, ExerciseLog, ExerciseDefinition, ExerciseTarget } from '../types';
import { INITIAL_PPL_PROGRAM } from '../data/pplProgramData';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import { checkSetForPR } from '../services/progressionEngine';
import {
  getOrSeedExercises,
  saveCustomExerciseToFirebase,
  getOrSeedProgram,
  saveProgramToFirebase,
  fetchUserSessionsFromFirebase,
  saveSessionToFirebase,
  fetchUserPRsFromFirebase,
  savePRToFirebase
} from '../services/firebaseService';

interface RestTimerState {
  secondsRemaining: number;
  totalSeconds: number;
  isRunning: boolean;
  exerciseName: string;
}

interface WorkoutStoreState {
  program: WorkoutProgram;
  exerciseDatabase: ExerciseDefinition[];
  activeSession: WorkoutSession | null;
  activeExerciseIndex: number;
  history: WorkoutSession[];
  personalRecords: PersonalRecord[];
  bodyMetrics: BodyMetric[];
  restTimer: RestTimerState;
  isLoadingFirebase: boolean;

  initializeFirebaseData: (userId?: string) => Promise<void>;
  saveNewRoutine: (name: string, exercises: ExerciseTarget[], userId?: string) => Promise<void>;
  createCustomExercise: (ex: ExerciseDefinition) => Promise<void>;

  startWorkout: (day: WorkoutDay) => void;
  updateSet: (exerciseId: string, setNumber: number, weight: number, reps: number, rir?: number) => void;
  toggleSetCompletion: (exerciseId: string, setNumber: number) => void;
  addSetToExercise: (exerciseId: string) => void;
  deleteSetFromExercise: (exerciseId: string, setNumber: number) => void;
  addExerciseToActiveSession: (exercise: { exerciseId: string; name: string; muscleGroup: string; equipment: string }) => void;
  removeExerciseFromActiveSession: (exerciseId: string) => void;
  replaceExerciseInActiveSession: (oldExerciseId: string, newExercise: { exerciseId: string; name: string; muscleGroup: string; equipment: string }) => void;
  reorderExercisesInActiveSession: (newExercises: ExerciseLog[]) => void;
  finishWorkout: (userId?: string) => Promise<void>;
  discardWorkout: () => void;

  startRestTimer: (seconds: number, exerciseName: string) => void;
  tickRestTimer: () => void;
  addTimerSeconds: (seconds: number) => void;
  skipRestTimer: () => void;

  loadUserWorkoutData: (userId: string) => Promise<void>;
  setActiveExerciseIndex: (index: number) => void;
}

export const useWorkoutStore = create<WorkoutStoreState>((set, get) => ({
  program: INITIAL_PPL_PROGRAM,
  exerciseDatabase: EXERCISE_DATABASE,
  activeSession: null,
  activeExerciseIndex: 0,
  history: [],
  personalRecords: [],
  bodyMetrics: [],
  isLoadingFirebase: false,
  restTimer: {
    secondsRemaining: 0,
    totalSeconds: 0,
    isRunning: false,
    exerciseName: ''
  },

  setActiveExerciseIndex: (index: number) => set({ activeExerciseIndex: index }),

  // --------------------------------------------------------
  // FIREBASE REALTIME INITIALIZATION & SYNC
  // --------------------------------------------------------
  initializeFirebaseData: async (userId?: string) => {
    set({ isLoadingFirebase: true });
    try {
      // 1. Load Exercises dynamically from Firebase
      const exercises = await getOrSeedExercises();
      // 2. Load Programs / Routines dynamically from Firebase
      const program = await getOrSeedProgram(userId);
      // 3. Load User History & PRs from Firebase if user logged in
      let history: WorkoutSession[] = [];
      let personalRecords: PersonalRecord[] = [];
      if (userId && userId !== 'guest-user-123') {
        history = await fetchUserSessionsFromFirebase(userId);
        personalRecords = await fetchUserPRsFromFirebase(userId);
      }

      set({
        exerciseDatabase: exercises,
        program: program || INITIAL_PPL_PROGRAM,
        history,
        personalRecords,
        isLoadingFirebase: false
      });
    } catch (err) {
      console.warn('Error syncing data with Firebase Firestore:', err);
      set({ isLoadingFirebase: false });
    }
  },

  saveNewRoutine: async (name: string, exercises: ExerciseTarget[], userId?: string) => {
    const { program } = get();
    const newDay: WorkoutDay = {
      id: `routine-day-${Date.now()}`,
      name,
      focus: 'Custom Routine',
      dayOrder: program.days.length + 1,
      exercises
    };

    const updatedProgram: WorkoutProgram = {
      ...program,
      days: [...program.days, newDay]
    };

    set({ program: updatedProgram });
    await saveProgramToFirebase(updatedProgram, userId);
  },

  createCustomExercise: async (ex: ExerciseDefinition) => {
    const { exerciseDatabase } = get();
    const updated = [ex, ...exerciseDatabase];
    set({ exerciseDatabase: updated });
    await saveCustomExerciseToFirebase(ex);
  },

  startWorkout: (day: WorkoutDay) => {
    const { history, program } = get();
    const previousSession = history
      .filter((s) => s.workoutDayId === day.id && s.status === 'completed')
      .sort((a, b) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime())[0];

    const sessionExercises = day.exercises.map((targetEx) => {
      const prevEx = previousSession?.exercises.find((e) => e.exerciseId === targetEx.exerciseId);

      const sets: SetLog[] = Array.from({ length: targetEx.targetSets }, (_, i) => {
        const setNum = i + 1;
        const prevSet = prevEx?.sets.find((s) => s.setNumber === setNum) || prevEx?.sets[0];
        return {
          id: `set-${Date.now()}-${targetEx.id}-${setNum}`,
          setNumber: setNum,
          weight: prevSet?.weight || 20,
          reps: prevSet?.reps || targetEx.minReps,
          rir: 2,
          completed: false
        };
      });

      return {
        id: `ex-log-${Date.now()}-${targetEx.id}`,
        exerciseId: targetEx.exerciseId,
        exerciseName: targetEx.name,
        muscleGroup: targetEx.muscleGroup,
        targetSets: targetEx.targetSets,
        minReps: targetEx.minReps,
        maxReps: targetEx.maxReps,
        notes: targetEx.notes,
        sets
      };
    });

    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      programId: program.id,
      workoutDayId: day.id,
      dayName: day.name,
      dayFocus: day.focus,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      totalVolume: 0,
      totalSets: 0,
      status: 'active',
      exercises: sessionExercises
    };

    set({
      activeSession: newSession,
      activeExerciseIndex: 0
    });
  },

  updateSet: (exerciseId: string, setNumber: number, weight: number, reps: number, rir?: number) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.exerciseId !== exerciseId) return ex;
      const updatedSets = ex.sets.map((s) => (s.setNumber === setNumber ? { ...s, weight, reps, rir } : s));
      return { ...ex, sets: updatedSets };
    });

    const updatedSession = { ...activeSession, exercises: updatedExercises };
    set({ activeSession: updatedSession });
  },

  toggleSetCompletion: (exerciseId: string, setNumber: number) => {
    const { activeSession, personalRecords, startRestTimer, program } = get();
    if (!activeSession) return;

    let targetRestSeconds = 90;
    let targetExName = '';
    let justCompleted = false;

    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.exerciseId !== exerciseId) return ex;
      targetExName = ex.exerciseName;

      const programDay = program.days.find((d) => d.id === activeSession.workoutDayId);
      const programEx = programDay?.exercises.find((e) => e.exerciseId === exerciseId);
      if (programEx) targetRestSeconds = programEx.restSeconds;

      const updatedSets = ex.sets.map((s) => {
        if (s.setNumber === setNumber) {
          const nextCompletedState = !s.completed;
          if (nextCompletedState) justCompleted = true;

          let isPR = s.isPR;
          if (nextCompletedState && s.weight > 0 && s.reps > 0) {
            const pr = checkSetForPR(ex.exerciseId, ex.exerciseName, ex.muscleGroup, s.weight, s.reps, personalRecords, activeSession.id);
            if (pr) {
              isPR = true;
              set({ personalRecords: [...get().personalRecords, pr] });
            }
          }

          return {
            ...s,
            completed: nextCompletedState,
            completedAt: nextCompletedState ? new Date().toISOString() : undefined,
            isPR
          };
        }
        return s;
      });

      return { ...ex, sets: updatedSets };
    });

    const updatedSession = { ...activeSession, exercises: updatedExercises };
    set({ activeSession: updatedSession });

    if (justCompleted) {
      startRestTimer(targetRestSeconds, targetExName);
    }
  },

  addSetToExercise: (exerciseId: string) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.exerciseId !== exerciseId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSetNum = ex.sets.length + 1;
      const newSet: SetLog = {
        id: `set-${Date.now()}-${newSetNum}`,
        setNumber: newSetNum,
        weight: lastSet ? lastSet.weight : 20,
        reps: lastSet ? lastSet.reps : ex.minReps,
        rir: 2,
        completed: false
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    });

    set({ activeSession: { ...activeSession, exercises: updatedExercises } });
  },

  addExerciseToActiveSession: (exercise: { exerciseId: string; name: string; muscleGroup: string; equipment: string }) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const newExLog: ExerciseLog = {
      id: `ex-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      targetSets: 3,
      minReps: 8,
      maxReps: 12,
      sets: [
        { id: `set-${Date.now()}-1`, setNumber: 1, weight: 20, reps: 10, completed: false },
        { id: `set-${Date.now()}-2`, setNumber: 2, weight: 20, reps: 10, completed: false },
        { id: `set-${Date.now()}-3`, setNumber: 3, weight: 20, reps: 10, completed: false }
      ]
    };

    const updatedExercises = [...activeSession.exercises, newExLog];
    set({
      activeSession: { ...activeSession, exercises: updatedExercises },
      activeExerciseIndex: updatedExercises.length - 1
    });
  },

  removeExerciseFromActiveSession: (exerciseId: string) => {
    const { activeSession } = get();
    if (!activeSession) return;
    const updatedExercises = activeSession.exercises.filter((ex) => ex.exerciseId !== exerciseId);
    set({ activeSession: { ...activeSession, exercises: updatedExercises } });
  },

  replaceExerciseInActiveSession: (oldExerciseId: string, newExercise: { exerciseId: string; name: string; muscleGroup: string; equipment: string }) => {
    const { activeSession } = get();
    if (!activeSession) return;
    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.exerciseId !== oldExerciseId) return ex;
      return {
        ...ex,
        exerciseId: newExercise.exerciseId,
        exerciseName: newExercise.name,
        muscleGroup: newExercise.muscleGroup,
      };
    });
    set({ activeSession: { ...activeSession, exercises: updatedExercises } });
  },

  reorderExercisesInActiveSession: (newExercises: ExerciseLog[]) => {
    const { activeSession } = get();
    if (!activeSession) return;
    set({ activeSession: { ...activeSession, exercises: newExercises } });
  },

  deleteSetFromExercise: (exerciseId: string, setNumber: number) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.exerciseId !== exerciseId) return ex;
      const filtered = ex.sets.filter((s) => s.setNumber !== setNumber);
      const reindexed = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      return { ...ex, sets: reindexed };
    });

    set({ activeSession: { ...activeSession, exercises: updatedExercises } });
  },

  finishWorkout: async (userId?: string) => {
    const { activeSession, history, personalRecords } = get();
    if (!activeSession) return;

    const completedAt = new Date().toISOString();
    const durationSeconds = Math.max(1, Math.round((new Date(completedAt).getTime() - new Date(activeSession.startedAt).getTime()) / 1000));

    let totalSetsCount = 0;
    let totalVol = 0;

    activeSession.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed && s.weight > 0 && s.reps > 0) {
          totalSetsCount += 1;
          totalVol += s.weight * s.reps;
        }
      });
    });

    const finishedSession: WorkoutSession = {
      ...activeSession,
      completedAt,
      durationSeconds,
      totalVolume: totalVol,
      totalSets: totalSetsCount,
      status: 'completed'
    };

    const newHistory = [finishedSession, ...history];
    set({
      history: newHistory,
      activeSession: null,
      restTimer: { secondsRemaining: 0, totalSeconds: 0, isRunning: false, exerciseName: '' }
    });

    if (userId && userId !== 'guest-user-123') {
      await saveSessionToFirebase(userId, finishedSession);
      for (const pr of personalRecords) {
        if (pr.sessionId === finishedSession.id) {
          await savePRToFirebase(userId, pr);
        }
      }
    }
  },

  discardWorkout: () => {
    set({
      activeSession: null,
      restTimer: { secondsRemaining: 0, totalSeconds: 0, isRunning: false, exerciseName: '' }
    });
  },

  startRestTimer: (seconds: number, exerciseName: string) => {
    set({
      restTimer: {
        secondsRemaining: seconds,
        totalSeconds: seconds,
        isRunning: true,
        exerciseName
      }
    });
  },

  tickRestTimer: () => {
    const { restTimer } = get();
    if (!restTimer.isRunning || restTimer.secondsRemaining <= 0) return;

    const nextSeconds = restTimer.secondsRemaining - 1;
    set({
      restTimer: {
        ...restTimer,
        secondsRemaining: nextSeconds,
        isRunning: nextSeconds > 0
      }
    });
  },

  addTimerSeconds: (seconds: number) => {
    const { restTimer } = get();
    set({
      restTimer: {
        ...restTimer,
        secondsRemaining: restTimer.secondsRemaining + seconds,
        totalSeconds: restTimer.totalSeconds + seconds,
        isRunning: true
      }
    });
  },

  skipRestTimer: () => {
    set({
      restTimer: { secondsRemaining: 0, totalSeconds: 0, isRunning: false, exerciseName: '' }
    });
  },

  loadUserWorkoutData: async (userId: string) => {
    if (!userId || userId === 'guest-user-123') return;
    try {
      const history = await fetchUserSessionsFromFirebase(userId);
      const personalRecords = await fetchUserPRsFromFirebase(userId);
      set({ history, personalRecords });
    } catch (err) {
      console.warn('Unable to fetch Firestore user data:', err);
    }
  }
}));

