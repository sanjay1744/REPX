import {
  calculateEstimated1RM,
  calculateVolume,
  getProgressionRecommendation,
  checkSetForPR
} from '../progressionEngine';
import type { SetLog, PersonalRecord } from '../../types';

export function runProgressionEngineTests() {
  console.log('--- Running Progression Engine Tests ---');

  const epley1RM = calculateEstimated1RM(60, 10);
  console.assert(Math.abs(epley1RM - 80) < 0.2, `Expected ~80kg 1RM, got ${epley1RM}`);

  const sets: SetLog[] = [
    { id: '1', setNumber: 1, weight: 60, reps: 8, completed: true },
    { id: '2', setNumber: 2, weight: 60, reps: 8, completed: true },
    { id: '3', setNumber: 3, weight: 57.5, reps: 8, completed: true },
    { id: '4', setNumber: 4, weight: 57.5, reps: 7, completed: true }
  ];
  const volume = calculateVolume(sets);
  const expectedVolume = 60 * 8 + 60 * 8 + 57.5 * 8 + 57.5 * 7;
  console.assert(volume === expectedVolume, `Expected volume ${expectedVolume}, got ${volume}`);

  const prevSets: SetLog[] = [
    { id: '1', setNumber: 1, weight: 60, reps: 7, completed: true },
    { id: '2', setNumber: 2, weight: 60, reps: 6, completed: true }
  ];
  const rec1 = getProgressionRecommendation('Bench Press', 6, 8, prevSets);
  console.assert(rec1.targetWeight === 60 && rec1.targetReps === 8, `Expected target 60kg x 8 reps, got ${rec1.targetWeight}kg x ${rec1.targetReps}`);

  const maxedSets: SetLog[] = [
    { id: '1', setNumber: 1, weight: 60, reps: 8, completed: true },
    { id: '2', setNumber: 2, weight: 60, reps: 8, completed: true }
  ];
  const rec2 = getProgressionRecommendation('Bench Press', 6, 8, maxedSets);
  console.assert(rec2.targetWeight === 62.5 && rec2.targetReps === 6, `Expected load increase to 62.5kg x 6 reps, got ${rec2.targetWeight}kg x ${rec2.targetReps}`);

  const existingPRs: PersonalRecord[] = [
    {
      id: 'pr-1',
      exerciseId: 'barbell-bench-press',
      exerciseName: 'Barbell Bench Press',
      muscleGroup: 'Chest',
      weight: 65,
      reps: 6,
      estimatedOneRepMax: 78,
      achievedAt: '2026-08-01',
      sessionId: 'sess-1',
      type: 'weight'
    }
  ];
  const newPR = checkSetForPR('barbell-bench-press', 'Barbell Bench Press', 'Chest', 70, 6, existingPRs, 'sess-2');
  console.assert(newPR !== null && newPR.weight === 70, `Expected new PR of 70kg, got ${newPR?.weight}`);

  console.log('✅ All Progression Engine Tests Passed!');
}

if (typeof window === 'undefined') {
  runProgressionEngineTests();
}
