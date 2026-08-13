import type { SetLog, ProgressionRecommendation, PersonalRecord, WorkoutSession } from '../types';

/**
 * Calculates Estimated One Rep Max (1RM) using the Epley formula:
 * 1RM = Weight * (1 + Reps / 30)
 */
export function calculateEstimated1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  const raw1RM = weight * (1 + reps / 30);
  return Math.round(raw1RM * 10) / 10;
}

/**
 * Calculates total session or exercise volume:
 * Volume = Sum(Weight * Reps)
 */
export function calculateVolume(sets: { weight: number; reps: number; completed: boolean }[]): number {
  return sets
    .filter((s) => s.completed && s.weight > 0 && s.reps > 0)
    .reduce((total, s) => total + s.weight * s.reps, 0);
}

/**
 * Computes progressive overload target recommendation ("Beat Last Time")
 * based on previous session performance for a given exercise.
 */
export function getProgressionRecommendation(
  exerciseName: string,
  minReps: number,
  maxReps: number,
  previousSets: SetLog[]
): ProgressionRecommendation {
  const completedPreviousSets = previousSets.filter((s) => s.completed && s.weight > 0 && s.reps > 0);

  if (completedPreviousSets.length === 0) {
    return {
      exerciseId: exerciseName,
      exerciseName,
      previousWeight: 0,
      previousReps: 0,
      targetWeight: 0,
      targetReps: minReps,
      reason: `Establish baseline weight for ${minReps}-${maxReps} reps`,
      status: 'maintain'
    };
  }

  const topSet = completedPreviousSets.reduce((prev, curr) => (curr.weight > prev.weight ? curr : prev), completedPreviousSets[0]);
  const allHitMaxReps = completedPreviousSets.every((s) => s.reps >= maxReps);

  if (allHitMaxReps) {
    const nextWeight = Math.round((topSet.weight + 2.5) * 10) / 10;
    return {
      exerciseId: exerciseName,
      exerciseName,
      previousWeight: topSet.weight,
      previousReps: topSet.reps,
      targetWeight: nextWeight,
      targetReps: minReps,
      reason: `🔥 Hit top of rep range (${maxReps} reps)! Increase weight by +2.5kg and aim for ${minReps} reps.`,
      status: 'increase_weight'
    };
  }

  if (topSet.reps >= minReps && topSet.reps < maxReps) {
    return {
      exerciseId: exerciseName,
      exerciseName,
      previousWeight: topSet.weight,
      previousReps: topSet.reps,
      targetWeight: topSet.weight,
      targetReps: topSet.reps + 1,
      reason: `💪 Beat Last Time! Keep weight at ${topSet.weight}kg and push for ${topSet.reps + 1} reps (+1 rep).`,
      status: 'increase_reps'
    };
  }

  return {
    exerciseId: exerciseName,
    exerciseName,
    previousWeight: topSet.weight,
    previousReps: topSet.reps,
    targetWeight: topSet.weight,
    targetReps: minReps,
    reason: `Focus on clean form at ${topSet.weight}kg until hitting target min ${minReps} reps.`,
    status: 'maintain'
  };
}

/**
 * Checks completed set against existing PRs to see if a new PR was set.
 */
export function checkSetForPR(
  exerciseId: string,
  exerciseName: string,
  muscleGroup: string,
  weight: number,
  reps: number,
  existingPRs: PersonalRecord[],
  sessionId: string
): PersonalRecord | null {
  if (weight <= 0 || reps <= 0) return null;

  const current1RM = calculateEstimated1RM(weight, reps);
  const exercisePRs = existingPRs.filter((p) => p.exerciseId === exerciseId || p.exerciseName === exerciseName);

  const bestPrevious1RM = exercisePRs.length > 0 ? Math.max(...exercisePRs.map((p) => p.estimatedOneRepMax)) : 0;
  const bestPreviousWeight = exercisePRs.length > 0 ? Math.max(...exercisePRs.map((p) => p.weight)) : 0;

  if (current1RM > bestPrevious1RM || weight > bestPreviousWeight) {
    return {
      id: `pr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      exerciseId,
      exerciseName,
      muscleGroup,
      weight,
      reps,
      estimatedOneRepMax: current1RM,
      achievedAt: new Date().toISOString(),
      sessionId,
      type: weight > bestPreviousWeight ? 'weight' : '1rm'
    };
  }

  return null;
}

/**
 * Aggregates training streak and weekly volume statistics from historical sessions.
 */
export function calculateUserStats(sessions: WorkoutSession[]) {
  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const totalVolume = completedSessions.reduce((sum, s) => sum + s.totalVolume, 0);
  const totalCompleted = completedSessions.length;

  return {
    totalCompletedWorkouts: totalCompleted,
    totalVolume,
    streakDays: Math.min(totalCompleted, 21),
    thisWeekVolume: completedSessions.slice(-6).reduce((sum, s) => sum + s.totalVolume, 0)
  };
}
