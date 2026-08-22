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
    <div className="space-y-4 sm:space-y-6 pb-24">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Training Analytics</h2>
        <p className="text-[11px] sm:text-xs text-zinc-400 font-semibold">Track volume progression, strength curves, and performance gains</p>
      </div>

      {completedSessions.length === 0 ? (
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-3.5">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl glass-input flex items-center justify-center mx-auto text-white shadow-xl">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">No Analytics Data Yet</h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Complete your first workout session to unlock progression charts and volume tracking graphs.
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl glass-input border border-white/15 text-white flex items-center justify-center font-bold">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">Workout Volume Trend</h3>
                  <p className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider">Total Load (kg) per Session</p>
                </div>
              </div>
            </div>

            <div className="h-52 sm:h-64 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeChartData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                  <XAxis dataKey="date" stroke="#71717A" fontSize={10} />
                  <YAxis stroke="#71717A" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(10, 10, 14, 0.95)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
                    labelStyle={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#FFFFFF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl glass-input border border-white/15 text-white flex items-center justify-center font-bold">
                  <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">Exercise Strength Curve</h3>
                  <p className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider">Top Weight & Est. 1RM</p>
                </div>
              </div>

              {allExercises.length > 0 && (
                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value)}
                  className="glass-input text-white border border-white/10 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-white cursor-pointer"
                >
                  {allExercises.map((ex) => (
                    <option key={String(ex)} value={String(ex)} className="bg-[#08080C] text-white">
                      {String(ex)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {exerciseTrendData.length === 0 ? (
              <div className="text-center text-xs text-zinc-400 py-8 font-semibold">
                No logs recorded for {selectedExercise} yet.
              </div>
            ) : (
              <div className="h-52 sm:h-64 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={exerciseTrendData as any[]}>
                    <defs>
                      <linearGradient id="color1RM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                    <XAxis dataKey="date" stroke="#71717A" fontSize={10} />
                    <YAxis stroke="#71717A" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(10, 10, 14, 0.95)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
                      labelStyle={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="estimated1RM" name="Est. 1RM (kg)" stroke="#FFFFFF" strokeWidth={2.5} fillOpacity={1} fill="url(#color1RM)" />
                    <Area type="monotone" dataKey="weight" name="Working Weight (kg)" stroke="#A1A1AA" strokeWidth={1.5} fill="none" />
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
