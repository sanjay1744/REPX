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
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Personal Records (PRs)</h2>
          <p className="text-xs text-slate-400">Your all-time heaviest lifts and estimated 1RM milestones</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
          <Trophy className="w-4 h-4" />
          <span>{topRecords.length} PRs Hit</span>
        </div>
      </div>

      {topRecords.length === 0 ? (
        <div className="bg-gym-card border border-gym-border rounded-3xl p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400">
            <Trophy className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No PRs Recorded Yet</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Log your working sets in a workout session. Any weight or rep record broken will populate here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topRecords.map((pr) => (
            <div
              key={pr.exerciseName}
              className="bg-gym-card border border-amber-500/30 hover:border-amber-500/60 rounded-3xl p-5 shadow-xl relative overflow-hidden transition-all group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -z-0"></div>

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    {pr.muscleGroup}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {format(new Date(pr.date), 'MMM dd, yyyy')}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                  {pr.exerciseName}
                </h3>

                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 rounded-2xl p-3 border border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Max Weight</div>
                    <div className="text-xl font-black text-amber-400">
                      {pr.weight} <span className="text-xs font-normal text-slate-300">kg × {pr.reps}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Est. 1RM</div>
                    <div className="text-xl font-black text-white">
                      {pr.estimated1RM} <span className="text-xs font-normal text-slate-400">kg</span>
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
