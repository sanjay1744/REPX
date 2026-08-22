import React from 'react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import type { WorkoutSession, ExerciseLog, SetLog } from '../types';
import { Trophy } from 'lucide-react';
import { format } from 'date-fns';

export const PersonalRecordsPage: React.FC = () => {
  const { history } = useWorkoutStore();

  const allCompletedSets = history
    .flatMap((session: WorkoutSession) =>
      session.exercises.flatMap((ex: ExerciseLog) =>
        ex.sets
          .filter((s: SetLog) => s.completed && s.weight > 0)
          .map((s: SetLog) => ({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            muscleGroup: ex.muscleGroup,
            weight: s.weight,
            reps: s.reps,
            estimated1RM: Math.round((s.weight * (1 + s.reps / 30)) * 10) / 10,
            date: session.completedAt || session.startedAt
          }))
      )
    );

  const topRecordsMap = new Map<string, typeof allCompletedSets[0]>();
  allCompletedSets.forEach((item) => {
    const existing = topRecordsMap.get(item.exerciseName);
    if (!existing || item.weight > existing.weight || (item.weight === existing.weight && item.reps > existing.reps)) {
      topRecordsMap.set(item.exerciseName, item);
    }
  });

  const topRecords = Array.from(topRecordsMap.values());

  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Personal Records (PRs)</h2>
          <p className="text-[11px] sm:text-xs text-zinc-400 font-semibold">Your all-time heaviest lifts and estimated 1RM milestones</p>
        </div>
        <div className="glass-input px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black text-white flex items-center gap-1.5 border border-white/20 shadow-sm">
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          <span>{topRecords.length} PRs</span>
        </div>
      </div>

      {topRecords.length === 0 ? (
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-3.5">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl glass-input flex items-center justify-center mx-auto text-white shadow-xl">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">No PRs Recorded Yet</h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Log your working sets in a workout session. Any weight or rep record broken will populate here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {topRecords.map((pr) => (
            <div
              key={pr.exerciseName}
              className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.01] group border border-white/10 hover:border-white/25"
            >
              <div className="relative z-10 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
                    {pr.muscleGroup}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-zinc-400">
                    {format(new Date(pr.date), 'MMM dd, yyyy')}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white">
                  {pr.exerciseName}
                </h3>

                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 glass-input rounded-xl sm:rounded-2xl p-3 sm:p-3.5">
                  <div>
                    <div className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider">Max Weight</div>
                    <div className="text-lg sm:text-xl font-black text-white">
                      {pr.weight} <span className="text-[10px] sm:text-xs font-normal text-zinc-400">kg × {pr.reps}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider">Est. 1RM</div>
                    <div className="text-lg sm:text-xl font-black text-white">
                      {pr.estimated1RM} <span className="text-[10px] sm:text-xs font-normal text-zinc-400">kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
