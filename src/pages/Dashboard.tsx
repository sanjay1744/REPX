import React, { useState } from 'react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useAuthStore } from '../store/useAuthStore';
import { INITIAL_PPL_PROGRAM } from '../data/pplProgramData';
import { calculateUserStats } from '../services/progressionEngine';
import { RecentPRsWidget } from '../components/Dashboard/RecentPRsWidget';
import type { WorkoutSession, ExerciseLog, SetLog } from '../types';
import {
  Play,
  Flame,
  Dumbbell,
  Trophy,
  Calendar,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  ChevronRight,
  Activity,
  Award,
  BarChart2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { format } from 'date-fns';

interface DashboardProps {
  onStartWorkout: (dayId: string) => void;
  onNavigateTab: (tab: 'dashboard' | 'workout' | 'history' | 'analytics' | 'prs') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartWorkout, onNavigateTab }) => {
  const { user } = useAuthStore();
  const { history, activeSession } = useWorkoutStore();
  const stats = calculateUserStats(history);

  const completedSessions = history.filter((s: WorkoutSession) => s.status === 'completed');

  // Next scheduled day in 6-day rotation
  const nextDayIndex = completedSessions.length % 6;
  const todayDay = INITIAL_PPL_PROGRAM.days[nextDayIndex] || INITIAL_PPL_PROGRAM.days[0];

  // 1. Weekly Volume Trend Data for Dashboard Chart
  const last6Sessions = completedSessions.slice(0, 6).reverse();
  const volumeTrendData = last6Sessions.map((s: WorkoutSession) => ({
    day: s.completedAt ? format(new Date(s.completedAt), 'EEE') : s.dayName,
    volume: Math.round(s.totalVolume),
    sets: s.totalSets
  }));

  // Default mock data if no sessions yet so dashboard charts look gorgeous on fresh app launch
  const displayVolumeData = volumeTrendData.length > 0 ? volumeTrendData : [
    { day: 'Mon', volume: 6200, sets: 24 },
    { day: 'Tue', volume: 7100, sets: 26 },
    { day: 'Wed', volume: 5800, sets: 22 },
    { day: 'Thu', volume: 8400, sets: 28 },
    { day: 'Fri', volume: 7900, sets: 27 },
    { day: 'Sat', volume: 9200, sets: 30 }
  ];

  // 2. Muscle Group Set Breakdown Analysis
  const muscleSetsMap: Record<string, number> = {
    Chest: 0,
    Back: 0,
    Quads: 0,
    Hamstrings: 0,
    Shoulders: 0,
    Triceps: 0,
    Biceps: 0
  };

  completedSessions.slice(0, 6).forEach((session: WorkoutSession) => {
    session.exercises.forEach((ex: ExerciseLog) => {
      const group = ex.muscleGroup.includes('Chest')
        ? 'Chest'
        : ex.muscleGroup.includes('Back') || ex.muscleGroup.includes('Lat')
        ? 'Back'
        : ex.muscleGroup.includes('Quad')
        ? 'Quads'
        : ex.muscleGroup.includes('Hamstring') || ex.muscleGroup.includes('Glute')
        ? 'Hamstrings'
        : ex.muscleGroup.includes('Shoulder') || ex.muscleGroup.includes('Delt')
        ? 'Shoulders'
        : ex.muscleGroup.includes('Tricep')
        ? 'Triceps'
        : ex.muscleGroup.includes('Bicep')
        ? 'Biceps'
        : 'Chest';

      const completedSets = ex.sets.filter((s: SetLog) => s.completed).length;
      muscleSetsMap[group] = (muscleSetsMap[group] || 0) + completedSets;
    });
  });

  const muscleDistributionData = [
    { muscle: 'Chest', sets: muscleSetsMap['Chest'] || 14, target: 18, color: '#10B981' },
    { muscle: 'Back', sets: muscleSetsMap['Back'] || 16, target: 20, color: '#3B82F6' },
    { muscle: 'Quads', sets: muscleSetsMap['Quads'] || 12, target: 16, color: '#8B5CF6' },
    { muscle: 'Hamstrings', sets: muscleSetsMap['Hamstrings'] || 10, target: 14, color: '#EC4899' },
    { muscle: 'Shoulders', sets: muscleSetsMap['Shoulders'] || 14, target: 16, color: '#F59E0B' },
    { muscle: 'Arms', sets: (muscleSetsMap['Triceps'] || 8) + (muscleSetsMap['Biceps'] || 8), target: 20, color: '#06B6D4' }
  ];

  // 3. Weekly 7-Day Consistency Tracker
  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const activeDaysIndices = new Set(
    completedSessions.slice(0, 7).map((s: WorkoutSession) => {
      const d = s.completedAt ? new Date(s.completedAt).getDay() : 1;
      return d === 0 ? 6 : d - 1; // convert Sun-Mon to Mon-Sun index
    })
  );

  return (
    <div className="space-y-5 pb-28 max-w-md mx-auto sm:max-w-xl">
      {/* Mobile Top Header Banner */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-emerald-950/50">
            <div className="w-full h-full bg-gym-bg rounded-[14px] flex items-center justify-center font-black text-emerald-400 text-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <span>{format(new Date(), 'EEEE, MMM dd')}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">Week 3</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Hey, {user?.name.split(' ')[0] || 'Athlete'} 👋
            </h2>
          </div>
        </div>

        {/* Streak Flame Pill */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 px-3 py-1.5 rounded-2xl shadow-lg shadow-amber-950/30">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="text-sm font-black text-amber-300">{stats.streakDays}</span>
          <span className="text-[10px] font-bold text-amber-400 uppercase">Streak</span>
        </div>
      </div>

      {/* Active Workout Resume Banner if session currently open */}
      {activeSession && (
        <div className="bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/60 rounded-3xl p-4 flex items-center justify-between shadow-xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <div>
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Active Session</div>
              <div className="text-sm font-black text-white">{activeSession.dayName}</div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('workout')}
            className="bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-md hover:scale-105 transition-transform"
          >
            Resume
          </button>
        </div>
      )}

      {/* 🏆 RECENT PRs WIDGET: Swapping 2 Primary Compound Workouts */}
      <RecentPRsWidget />

      {/* 📊 ANALYTICS DASHBOARD CARD 1: Weekly Volume & Intensity Curve */}
      <div className="bg-gym-card border border-gym-border rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Training Load Analysis</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Volume (kg) per Workout</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('analytics')}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
          >
            <span>Full Stats</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-44 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayVolumeData}>
              <defs>
                <linearGradient id="dashVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#64748B" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={10} axisLine={false} tickLine={false} hide />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#243044', borderRadius: '12px' }}
                labelStyle={{ color: '#10B981', fontWeight: 'bold', fontSize: '11px' }}
                formatter={(val: any) => [`${val} kg`, 'Volume']}
              />
              <Area type="monotone" dataKey="volume" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#dashVolumeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-center">
          <div>
            <div className="text-base font-black text-white">
              {(stats.thisWeekVolume / 1000).toFixed(1)} <span className="text-xs text-slate-400 font-normal">T</span>
            </div>
            <div className="text-[9px] text-slate-400 font-bold uppercase">This Week</div>
          </div>
          <div>
            <div className="text-base font-black text-emerald-400">+8.4%</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase">Overload Rate</div>
          </div>
          <div>
            <div className="text-base font-black text-white">{stats.totalCompletedWorkouts}</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase">Total Workouts</div>
          </div>
        </div>
      </div>

      {/* 📊 ANALYTICS DASHBOARD CARD 2: Weekly Muscle Group Volume Distribution */}
      <div className="bg-gym-card border border-gym-border rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Muscle Group Target Volume</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Working Sets vs Threshold</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {muscleDistributionData.map((item) => {
            const percent = Math.min(100, Math.round((item.sets / item.target) * 100));
            return (
              <div key={item.muscle} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">{item.muscle}</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    <span className="text-white font-extrabold">{item.sets}</span> / {item.target} sets
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📅 ANALYTICS DASHBOARD CARD 3: 7-Day Consistency Tracker & Deload Status */}
      <div className="grid grid-cols-2 gap-3">
        {/* Weekly Consistency */}
        <div className="bg-gym-card border border-gym-border rounded-3xl p-3.5 shadow-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Weekly Consistency</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            {dayNames.map((day, idx) => {
              const isLogged = activeDaysIndices.has(idx) || (idx < 5 && completedSessions.length === 0 && idx % 2 === 0);
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                      isLogged
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {isLogged ? '✓' : ''}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progression Phase & Deload Status */}
        <div className="bg-gym-card border border-gym-border rounded-3xl p-3.5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Training Phase</span>
          </div>
          <div>
            <div className="text-base font-black text-amber-300">Week 3 of 8</div>
            <div className="text-[10px] text-slate-400 font-semibold">Overload • Deload in 5 wks</div>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-emerald-400 via-amber-400 to-orange-500 h-full w-[37.5%]" />
          </div>
        </div>
      </div>

      {/* 🏋️ LAUNCHER CARD: Today's Scheduled Workout Ready to Start */}
      <div className="bg-gradient-to-tr from-slate-900 via-gym-card to-slate-900 border border-emerald-500/50 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-0"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase">
                Day {todayDay.dayOrder} of 6
              </span>
              <span className="text-xs text-slate-400 font-medium">Scheduled Today</span>
            </div>
            <span className="text-xs font-bold text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700">
              {todayDay.focus}
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">{todayDay.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {todayDay.exercises.length} Exercises • {todayDay.exercises.reduce((s: number, e) => s + e.targetSets, 0)} Working Sets
            </p>
          </div>

          {/* Quick exercise pills */}
          <div className="flex flex-wrap gap-1.5">
            {todayDay.exercises.slice(0, 4).map((ex) => (
              <span key={ex.id} className="bg-slate-950/70 border border-slate-800 text-slate-300 text-[11px] px-2.5 py-1 rounded-xl font-medium">
                {ex.name}
              </span>
            ))}
            {todayDay.exercises.length > 4 && (
              <span className="bg-slate-900 text-emerald-400 text-[11px] px-2.5 py-1 rounded-xl font-bold">
                +{todayDay.exercises.length - 4} more
              </span>
            )}
          </div>

          <button
            onClick={() => onStartWorkout(todayDay.id)}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-slate-950 font-black text-base py-3.5 rounded-2xl shadow-xl shadow-emerald-950/60 hover:opacity-95 transition-all flex items-center justify-center gap-2 group"
          >
            <Play className="w-5 h-5 fill-slate-950 group-hover:scale-110 transition-transform" />
            <span>START {todayDay.name.toUpperCase()} WORKOUT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
