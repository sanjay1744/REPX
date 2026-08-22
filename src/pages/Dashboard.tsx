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
    { muscle: 'Chest', sets: muscleSetsMap['Chest'] || 14, target: 18, color: '#FFFFFF' },
    { muscle: 'Back', sets: muscleSetsMap['Back'] || 16, target: 20, color: '#3B82F6' },
    { muscle: 'Quads', sets: muscleSetsMap['Quads'] || 12, target: 16, color: '#E4E4E7' },
    { muscle: 'Hamstrings', sets: muscleSetsMap['Hamstrings'] || 10, target: 14, color: '#A1A1AA' },
    { muscle: 'Shoulders', sets: muscleSetsMap['Shoulders'] || 14, target: 16, color: '#60A5FA' },
    { muscle: 'Arms', sets: (muscleSetsMap['Triceps'] || 8) + (muscleSetsMap['Biceps'] || 8), target: 20, color: '#D4D4D8' }
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
    <div className="space-y-4 sm:space-y-5 pb-24 max-w-md mx-auto sm:max-w-xl relative">
      {/* Mobile Top Header Banner */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white p-0.5 shadow-md">
            <div className="w-full h-full bg-[#08080C] rounded-[9px] sm:rounded-[14px] flex items-center justify-center font-black text-white text-base sm:text-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-white border-2 border-[#08080C]"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-zinc-400 font-semibold">
              <span>{format(new Date(), 'EEEE, MMM dd')}</span>
              <span>•</span>
              <span className="text-white font-bold">Week 3</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Hey, {user?.name.split(' ')[0] || 'Athlete'} 👋
            </h2>
          </div>
        </div>

        {/* Streak Flame Pill */}
        <div className="flex items-center gap-1 sm:gap-1.5 glass-input px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl border border-white/15">
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white animate-pulse" />
          <span className="text-xs sm:text-sm font-black text-white">{stats.streakDays}</span>
          <span className="text-[9px] sm:text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Streak</span>
        </div>
      </div>

      {/* Active Workout Resume Banner if session currently open */}
      {activeSession && (
        <div className="glass-card-active rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 flex items-center justify-between shadow-xl animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#FFFFFF]"></div>
            <div>
              <div className="text-[9px] sm:text-[10px] font-extrabold text-zinc-300 uppercase tracking-widest">Active Session</div>
              <div className="text-xs sm:text-sm font-black text-white">{activeSession.dayName}</div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('workout')}
            className="bg-white hover:bg-zinc-200 text-black px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black shadow-md hover:scale-105 transition-transform"
          >
            Resume
          </button>
        </div>
      )}

      {/* 🏆 RECENT PRs WIDGET: Swapping Primary Compound Workouts */}
      <RecentPRsWidget />

      {/* 📊 ANALYTICS DASHBOARD CARD 1: Weekly Volume & Intensity Curve */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl glass-input border border-white/15 text-white flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white">Training Load Analysis</h3>
              <p className="text-[9px] sm:text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Volume (kg) per Workout</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('analytics')}
            className="text-[10px] sm:text-[11px] font-extrabold text-white hover:text-zinc-300 flex items-center gap-0.5 glass-input px-2 py-1 rounded-xl transition-colors"
          >
            <span>Full Stats</span>
            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        <div className="h-36 sm:h-44 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayVolumeData}>
              <defs>
                <linearGradient id="dashVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#71717A" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#71717A" fontSize={10} axisLine={false} tickLine={false} hide />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(10, 10, 14, 0.95)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
                labelStyle={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '11px' }}
                formatter={(val: any) => [`${val} kg`, 'Volume']}
              />
              <Area type="monotone" dataKey="volume" stroke="#FFFFFF" strokeWidth={2.5} fillOpacity={1} fill="url(#dashVolumeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-white/[0.08] pt-2.5 text-center">
          <div>
            <div className="text-xs sm:text-base font-black text-white">
              {(stats.thisWeekVolume / 1000).toFixed(1)} <span className="text-[10px] sm:text-xs text-zinc-400 font-normal">T</span>
            </div>
            <div className="text-[8px] sm:text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider">This Week</div>
          </div>
          <div>
            <div className="text-xs sm:text-base font-black text-white">+8.4%</div>
            <div className="text-[8px] sm:text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider">Overload Rate</div>
          </div>
          <div>
            <div className="text-xs sm:text-base font-black text-white">{stats.totalCompletedWorkouts}</div>
            <div className="text-[8px] sm:text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider">Total Workouts</div>
          </div>
        </div>
      </div>

      {/* 📊 ANALYTICS DASHBOARD CARD 2: Weekly Muscle Group Volume Distribution */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl glass-input border border-white/15 text-white flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white">Muscle Group Target Volume</h3>
              <p className="text-[9px] sm:text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Working Sets vs Threshold</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {muscleDistributionData.map((item) => {
            const percent = Math.min(100, Math.round((item.sets / item.target) * 100));
            return (
              <div key={item.muscle} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-200">{item.muscle}</span>
                  <span className="text-zinc-400 font-mono text-[10px] sm:text-[11px]">
                    <span className="text-white font-extrabold">{item.sets}</span> / {item.target} sets
                  </span>
                </div>
                <div className="w-full bg-[#08080C] h-1.5 sm:h-2 rounded-full overflow-hidden border border-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700 shadow-sm"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📅 ANALYTICS DASHBOARD CARD 3: 7-Day Consistency Tracker & Deload Status */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Weekly Consistency */}
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xl space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
            <Calendar className="w-3.5 h-3.5 text-white" />
            <span>Consistency</span>
          </div>
          <div className="flex items-center justify-between pt-0.5">
            {dayNames.map((day, idx) => {
              const isLogged = activeDaysIndices.has(idx) || (idx < 5 && completedSessions.length === 0 && idx % 2 === 0);
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-black transition-all ${
                      isLogged
                        ? 'bg-white text-black shadow-md'
                        : 'bg-[#08080C] text-zinc-500 border border-white/[0.08]'
                    }`}
                  >
                    {isLogged ? '✓' : ''}
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-bold text-zinc-400">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progression Phase & Deload Status */}
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>Training Phase</span>
          </div>
          <div>
            <div className="text-sm sm:text-base font-black text-white">Week 3 of 8</div>
            <div className="text-[9px] sm:text-[10px] text-zinc-400 font-semibold">Overload • Deload in 5 wks</div>
          </div>
          <div className="w-full bg-[#08080C] h-1.5 rounded-full overflow-hidden border border-white/[0.08]">
            <div className="bg-gradient-to-r from-white to-zinc-400 h-full w-[37.5%]" />
          </div>
        </div>
      </div>

      {/* 🏋️ LAUNCHER CARD: Today's Scheduled Workout Ready to Start */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden border border-white/15">
        <div className="relative z-10 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="bg-white/10 text-white border border-white/20 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                Day {todayDay.dayOrder} of 6
              </span>
              <span className="text-[10px] sm:text-xs text-zinc-400 font-semibold">Scheduled Today</span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-white glass-input px-2.5 py-1 rounded-xl">
              {todayDay.focus}
            </span>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white">{todayDay.name}</h3>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              {todayDay.exercises.length} Exercises • {todayDay.exercises.reduce((s: number, e) => s + e.targetSets, 0)} Working Sets
            </p>
          </div>

          {/* Quick exercise pills */}
          <div className="flex flex-wrap gap-1.5">
            {todayDay.exercises.slice(0, 4).map((ex) => (
              <span key={ex.id} className="glass-input text-zinc-200 text-[10px] sm:text-[11px] px-2.5 py-1 rounded-xl font-medium">
                {ex.name}
              </span>
            ))}
            {todayDay.exercises.length > 4 && (
              <span className="bg-white/10 border border-white/20 text-white text-[10px] sm:text-[11px] px-2.5 py-1 rounded-xl font-extrabold">
                +{todayDay.exercises.length - 4} more
              </span>
            )}
          </div>

          <button
            onClick={() => onStartWorkout(todayDay.id)}
            className="w-full bg-white hover:bg-zinc-200 text-black font-black text-sm sm:text-base py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-2 group hover:scale-[1.01] active:scale-95"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black group-hover:scale-110 transition-transform" />
            <span>START {todayDay.name.toUpperCase()} WORKOUT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
