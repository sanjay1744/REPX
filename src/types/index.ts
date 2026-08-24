export type WeightUnit = 'kg' | 'lbs';

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: 'Abdominals' | 'Biceps' | 'Chest' | 'Forearms' | 'Lats' | 'Lower Back' | 'Neck' | 'Shoulders' | 'Traps' | 'Triceps' | 'Upper Back' | 'Calves' | 'Glutes' | 'Hamstrings' | 'Quads' | string;
  category: 'Upper Body' | 'Lower Body' | 'Core' | string;
  equipment: 'None' | 'Barbell' | 'Dumbbell' | 'Kettlebell' | 'Machine' | 'Plate' | 'Resistance Band' | 'Suspension Band' | 'Cable' | 'Other' | string;
  instructions?: string;
}

export interface UserProfile {

  uid: string;
  name: string;
  email: string;
  units: WeightUnit;
  currentProgramId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseTarget {
  id: string;
  exerciseId: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  order: number;
  targetSets: number;
  minReps: number;
  maxReps: number;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutDay {
  id: string;
  name: string; // e.g. "Push A"
  focus: string; // e.g. "Chest Focus"
  dayOrder: number; // 1-6
  exercises: ExerciseTarget[];
}

export interface WorkoutProgram {
  id: string;
  name: string; // e.g. "6-Day Advanced PPL"
  description: string;
  daysPerWeek: number;
  days: WorkoutDay[];
  active: boolean;
  createdAt: string;
}

export interface SetLog {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  rir?: number; // Reps In Reserve
  rpe?: number; // Rate of Perceived Exertion
  restSeconds?: number;
  completed: boolean;
  completedAt?: string;
  isPR?: boolean;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  targetSets: number;
  minReps: number;
  maxReps: number;
  notes?: string;
  sets: SetLog[];
}

export interface WorkoutSession {
  id: string;
  programId: string;
  workoutDayId: string;
  dayName: string;
  dayFocus: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  totalVolume: number;
  totalSets: number;
  status: 'active' | 'completed' | 'discarded';
  exercises: ExerciseLog[];
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  estimatedOneRepMax: number;
  achievedAt: string;
  sessionId: string;
  type: 'weight' | 'reps' | '1rm';
}

export interface ProgressionRecommendation {
  exerciseId: string;
  exerciseName: string;
  previousWeight: number;
  previousReps: number;
  targetWeight: number;
  targetReps: number;
  reason: string; // e.g., "+1 rep target", "Increase weight by 2.5kg", "Maintain current weight"
  status: 'increase_reps' | 'increase_weight' | 'maintain' | 'deload';
}

export interface BodyMetric {
  id: string;
  date: string;
  bodyweight?: number; // in user's unit
  chest?: number;
  waist?: number;
  arms?: number;
  thighs?: number;
  photoUrl?: string;
  notes?: string;
}
