import React, { useState } from 'react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import type { WorkoutSession, ExerciseLog, SetLog } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BarChart3, TrendingUp, Dumbbell } from 'lucide-react';
import { format } from 'date-fns';

export const AnalyticsPage: React.FC = () => {
  const { history } = useWorkoutStore();
  const completedSessions = history.filter((s: WorkoutSession) => s.status === 'completed');

  const volumeChartData = completedSessions
    .slice()
    .reverse()
    .map((s: WorkoutSession) => ({
      date: s.completedAt ? format(new Date(s.completedAt), 'MMM dd') : 'Session',
      volume: s.totalVolume,
      sets: s.totalSets
    }));

  const allExercises = Array.from(
    new Set(
      completedSessions.flatMap((s: WorkoutSession) => s.exercises.map((e: ExerciseLog) => e.exerciseName))
    )
  );

  const [selectedExercise, setSelectedExercise] = useState<string>(
    (allExercises[0] as string) || 'Barbell Bench Press'
  );

  const exerciseTrendData = completedSessions
    .slice()
    .reverse()
    .map((session: WorkoutSession) => {
      const ex = session.exercises.find((e: ExerciseLog) => e.exerciseName === selectedExercise);
      if (!ex) return null;
      const topSet = ex.sets.filter((s: SetLog) => s.completed && s.weight > 0).sort((a: SetLog, b: SetLog) => b.weight - a.weight)[0];
      if (!topSet) return null;
      return {
        date: session.completedAt ? format(new Date(session.completedAt), 'MMM dd') : 'Session',
        weight: topSet.weight,
        reps: topSet.reps,
        estimated1RM: Math.round((topSet.weight * (1 + topSet.reps / 30)) * 10) / 10
      };
    })
    .filter(Boolean);

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h2 className="text-2xl font-black text-white">Training Analytics</h2>
        <p className="text-xs text-slate-400">Track volume progression, strength curves, and performance gains</p>
      </div>

      {completedSessions.length === 0 ? (
        <div className="bg-gym-card border border-gym-border rounded-3xl p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <BarChart3 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Analytics Data Yet</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Complete your first workout session to unlock progression charts and volume tracking graphs.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gym-card border border-gym-border rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Workout Volume Trend</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Load (kg) per Session</p>
                </div>
              </div>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeChartData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#243044" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#151D2A', borderColor: '#243044', borderRadius: '12px' }}
                    labelStyle={{ color: '#10B981', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gym-card border border-gym-border rounded-3xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Exercise Strength Curve</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Top Weight & Est. 1RM</p>
                </div>
              </div>

              {allExercises.length > 0 && (
                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="bg-slate-900 text-white border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {allExercises.map((ex) => (
                    <option key={String(ex)} value={String(ex)}>
                      {String(ex)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {exerciseTrendData.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-8">
                No logs recorded for {selectedExercise} yet.
              </div>
            ) : (
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={exerciseTrendData as any[]}>
                    <defs>
                      <linearGradient id="color1RM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#243044" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#151D2A', borderColor: '#243044', borderRadius: '12px' }}
                      labelStyle={{ color: '#8B5CF6', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="estimated1RM" name="Est. 1RM (kg)" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#color1RM)" />
                    <Area type="monotone" dataKey="weight" name="Working Weight (kg)" stroke="#10B981" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
