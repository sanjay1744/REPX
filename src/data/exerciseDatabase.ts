export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: 'Abdominals' | 'Biceps' | 'Chest' | 'Forearms' | 'Lats' | 'Lower Back' | 'Neck' | 'Shoulders' | 'Traps' | 'Triceps' | 'Upper Back' | 'Calves' | 'Glutes' | 'Hamstrings' | 'Quads';
  category: 'Upper Body' | 'Lower Body' | 'Core';
  equipment: 'None' | 'Barbell' | 'Dumbbell' | 'Kettlebell' | 'Machine' | 'Plate' | 'Resistance Band' | 'Suspension Band' | 'Cable' | 'Other';
  instructions?: string;
}

export const EXERCISE_DATABASE: ExerciseDefinition[] = [
  // Chest
  { id: 'barbell-bench-press', name: 'Bench Press (Barbell)', muscleGroup: 'Chest', category: 'Upper Body', equipment: 'Barbell' },
  { id: 'db-bench-press', name: 'Bench Press (Dumbbell)', muscleGroup: 'Chest', category: 'Upper Body', equipment: 'Dumbbell' },
  { id: 'incline-db-press', name: 'Incline Bench Press (Dumbbell)', muscleGroup: 'Chest', category: 'Upper Body', equipment: 'Dumbbell' },
  { id: 'incline-barbell-press', name: 'Incline Bench Press (Barbell)', muscleGroup: 'Chest', category: 'Upper Body', equipment: 'Barbell' },
  { id: 'cable-fly-crossovers', name: 'Cable Fly Crossovers', muscleGroup: 'Chest', category: 'Upper Body', equipment: 'Cable' },
  { id: 'machine-chest-press', name: 'Chest Press (Machine)', muscleGroup: 'Chest', category: 'Upper Body', equipment: 'Machine' },
  { id: 'pec-deck-fly', name: 'Pec Deck Fly', muscleGroup: 'Chest', category: 'Upper Body', equipment: 'Machine' },
  { id: 'push-ups', name: 'Push Up', muscleGroup: 'Chest', category: 'Upper Body', equipment: 'None' },
  { id: 'chest-dips', name: 'Chest Dips', muscleGroup: 'Chest', category: 'Upper Body', equipment: 'None' },

  // Back / Lats / Upper Back
  { id: 'bent-over-row-barbell', name: 'Bent Over Row (Barbell)', muscleGroup: 'Upper Back', category: 'Upper Body', equipment: 'Barbell' },
  { id: 'single-arm-db-row', name: 'Single Arm Row (Dumbbell)', muscleGroup: 'Lats', category: 'Upper Body', equipment: 'Dumbbell' },
  { id: 'lat-pulldown-cable', name: 'Lat Pulldown (Cable)', muscleGroup: 'Lats', category: 'Upper Body', equipment: 'Cable' },
  { id: 'wide-grip-lat-pulldown', name: 'Wide Grip Lat Pulldown', muscleGroup: 'Lats', category: 'Upper Body', equipment: 'Cable' },
  { id: 'seated-cable-row', name: 'Seated Row (Cable)', muscleGroup: 'Upper Back', category: 'Upper Body', equipment: 'Cable' },
  { id: 'pull-ups', name: 'Pull Up', muscleGroup: 'Lats', category: 'Upper Body', equipment: 'None' },
  { id: 'chin-ups', name: 'Chin Up', muscleGroup: 'Lats', category: 'Upper Body', equipment: 'None' },
  { id: 'chest-supported-row', name: 'Chest Supported Row', muscleGroup: 'Upper Back', category: 'Upper Body', equipment: 'Machine' },
  { id: 'db-shrugs', name: 'Shrugs (Dumbbell)', muscleGroup: 'Traps', category: 'Upper Body', equipment: 'Dumbbell' },
  { id: 'barbell-shrugs', name: 'Shrugs (Barbell)', muscleGroup: 'Traps', category: 'Upper Body', equipment: 'Barbell' },
  { id: 'back-extension', name: 'Back Extension', muscleGroup: 'Lower Back', category: 'Upper Body', equipment: 'None' },

  // Shoulders
  { id: 'standing-barbell-ohp', name: 'Overhead Press (Barbell)', muscleGroup: 'Shoulders', category: 'Upper Body', equipment: 'Barbell' },
  { id: 'seated-db-shoulder-press', name: 'Shoulder Press (Dumbbell)', muscleGroup: 'Shoulders', category: 'Upper Body', equipment: 'Dumbbell' },
  { id: 'db-lateral-raise', name: 'Lateral Raise (Dumbbell)', muscleGroup: 'Shoulders', category: 'Upper Body', equipment: 'Dumbbell' },
  { id: 'cable-lateral-raise', name: 'Lateral Raise (Cable)', muscleGroup: 'Shoulders', category: 'Upper Body', equipment: 'Cable' },
  { id: 'face-pull', name: 'Face Pull', muscleGroup: 'Shoulders', category: 'Upper Body', equipment: 'Cable' },
  { id: 'reverse-pec-deck', name: 'Rear Delt Fly (Machine)', muscleGroup: 'Shoulders', category: 'Upper Body', equipment: 'Machine' },

  // Biceps
  { id: 'bicep-curl-dumbbell', name: 'Bicep Curl (Dumbbell)', muscleGroup: 'Biceps', category: 'Upper Body', equipment: 'Dumbbell' },
  { id: 'ez-bar-curl', name: 'Bicep Curl (EZ Bar)', muscleGroup: 'Biceps', category: 'Upper Body', equipment: 'Barbell' },
  { id: 'hammer-curls', name: 'Hammer Curl (Dumbbell)', muscleGroup: 'Biceps', category: 'Upper Body', equipment: 'Dumbbell' },
  { id: 'incline-db-curl', name: 'Incline Bicep Curl (Dumbbell)', muscleGroup: 'Biceps', category: 'Upper Body', equipment: 'Dumbbell' },
  { id: 'preacher-curl-ez', name: 'Preacher Curl (EZ Bar)', muscleGroup: 'Biceps', category: 'Upper Body', equipment: 'Barbell' },
  { id: 'cable-bicep-curl', name: 'Bicep Curl (Cable)', muscleGroup: 'Biceps', category: 'Upper Body', equipment: 'Cable' },

  // Triceps
  { id: 'rope-pushdown', name: 'Triceps Pushdown (Cable Rope)', muscleGroup: 'Triceps', category: 'Upper Body', equipment: 'Cable' },
  { id: 'ez-skullcrushers', name: 'Skullcrusher (EZ Bar)', muscleGroup: 'Triceps', category: 'Upper Body', equipment: 'Barbell' },
  { id: 'overhead-rope-extension', name: 'Overhead Triceps Extension (Cable)', muscleGroup: 'Triceps', category: 'Upper Body', equipment: 'Cable' },
  { id: 'triceps-dips', name: 'Triceps Dips', muscleGroup: 'Triceps', category: 'Upper Body', equipment: 'None' },
  { id: 'close-grip-bench-press', name: 'Bench Press - Close Grip (Barbell)', muscleGroup: 'Triceps', category: 'Upper Body', equipment: 'Barbell' },

  // Legs / Quads / Hamstrings / Glutes / Calves
  { id: 'barbell-squat', name: 'Squat (Barbell)', muscleGroup: 'Quads', category: 'Lower Body', equipment: 'Barbell' },
  { id: 'leg-press', name: 'Leg Press (Machine)', muscleGroup: 'Quads', category: 'Lower Body', equipment: 'Machine' },
  { id: 'goblet-squat', name: 'Goblet Squat (Dumbbell)', muscleGroup: 'Quads', category: 'Lower Body', equipment: 'Dumbbell' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', muscleGroup: 'Quads', category: 'Lower Body', equipment: 'Dumbbell' },
  { id: 'deadlift-barbell', name: 'Deadlift (Barbell)', muscleGroup: 'Glutes', category: 'Lower Body', equipment: 'Barbell' },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift (Barbell)', muscleGroup: 'Hamstrings', category: 'Lower Body', equipment: 'Barbell' },
  { id: 'lying-leg-curl', name: 'Leg Curl (Lying Machine)', muscleGroup: 'Hamstrings', category: 'Lower Body', equipment: 'Machine' },
  { id: 'seated-leg-curl', name: 'Leg Curl (Seated Machine)', muscleGroup: 'Hamstrings', category: 'Lower Body', equipment: 'Machine' },
  { id: 'barbell-hip-thrust', name: 'Hip Thrust (Barbell)', muscleGroup: 'Glutes', category: 'Lower Body', equipment: 'Barbell' },
  { id: 'standing-calf-raise', name: 'Calf Raise (Standing Machine)', muscleGroup: 'Calves', category: 'Lower Body', equipment: 'Machine' },
  { id: 'seated-calf-raise', name: 'Calf Raise (Seated Machine)', muscleGroup: 'Calves', category: 'Lower Body', equipment: 'Machine' },

  // Abs / Core
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroup: 'Abdominals', category: 'Core', equipment: 'None' },
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroup: 'Abdominals', category: 'Core', equipment: 'Cable' },
  { id: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', muscleGroup: 'Abdominals', category: 'Core', equipment: 'Other' },
  { id: 'plank', name: 'Plank', muscleGroup: 'Abdominals', category: 'Core', equipment: 'None' }
];
