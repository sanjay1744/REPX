import React, { useState, useEffect } from 'react';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import type { WorkoutSession, ExerciseLog, SetLog } from '../../types';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

export interface CompoundPRItem {
  id: string;
  name: string;
  weight: number;
  reps: number;
  unit: string;
  increase: string;
  isCustom?: boolean;
}

// Master list of primary compound workouts with fallback benchmark PR data
const DEFAULT_COMPOUND_PRS: CompoundPRItem[] = [
  { id: 'bench-press', name: 'Bench Press', weight: 70, reps: 6, unit: 'kg', increase: '+2.5 kg' },
  { id: 'squat', name: 'Squat', weight: 100, reps: 5, unit: 'kg', increase: '+5 kg' },
  { id: 'deadlift', name: 'Deadlift', weight: 140, reps: 5, unit: 'kg', increase: '+5 kg' },
  { id: 'ohp', name: 'Overhead Press', weight: 50, reps: 8, unit: 'kg', increase: '+2.5 kg' },
  { id: 'barbell-row', name: 'Barbell Row', weight: 75, reps: 8, unit: 'kg', increase: '+2.5 kg' },
  { id: 'incline-press', name: 'Incline DB Press', weight: 32, reps: 8, unit: 'kg', increase: '+2 kg' },
  { id: 'rdl', name: 'Romanian Deadlift', weight: 95, reps: 8, unit: 'kg', increase: '+5 kg' },
  { id: 'leg-press', name: 'Leg Press', weight: 220, reps: 10, unit: 'kg', increase: '+10 kg' }
];

// Exercise name mappings to detect compound movements in user history
const COMPOUND_KEYWORDS: Record<string, string> = {
  'bench press': 'Bench Press',
  'back squat': 'Squat',
  'squat': 'Squat',
  'deadlift': 'Deadlift',
  'overhead press': 'Overhead Press',
  'ohp': 'Overhead Press',
  'bent-over row': 'Barbell Row',
  'barbell row': 'Barbell Row',
  'incline dumbbell press': 'Incline DB Press',
  'incline db press': 'Incline DB Press',
  'romanian deadlift': 'Romanian Deadlift',
  'rdl': 'Romanian Deadlift',
  'leg press': 'Leg Press'
};

export const RecentPRsWidget: React.FC = () => {
  const { history } = useWorkoutStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Compute compound PRs from user history if available, else use master default list
  const getCompoundPRs = (): CompoundPRItem[] => {
    if (!history || history.length === 0) return DEFAULT_COMPOUND_PRS;

    const prMap = new Map<string, { weight: number; reps: number; prevWeight: number }>();

    history.forEach((session: WorkoutSession) => {
      session.exercises.forEach((ex: ExerciseLog) => {
        const lowerName = ex.exerciseName.toLowerCase();
        let matchedKey = '';

        for (const [key, displayName] of Object.entries(COMPOUND_KEYWORDS)) {
          if (lowerName.includes(key)) {
            matchedKey = displayName;
            break;
          }
        }

        if (matchedKey) {
          ex.sets.forEach((set: SetLog) => {
            if (set.completed && set.weight > 0) {
              const existing = prMap.get(matchedKey);
              if (!existing) {
                prMap.set(matchedKey, { weight: set.weight, reps: set.reps, prevWeight: set.weight * 0.95 });
              } else if (set.weight > existing.weight || (set.weight === existing.weight && set.reps > existing.reps)) {
                prMap.set(matchedKey, {
                  weight: set.weight,
                  reps: set.reps,
                  prevWeight: existing.weight
                });
              }
            }
          });
        }
      });
    });

    // Merge calculated history PRs with default compounds so we always have a complete list
    return DEFAULT_COMPOUND_PRS.map((def) => {
      const recorded = prMap.get(def.name);
      if (recorded) {
        const diff = recorded.weight - recorded.prevWeight;
        const incText = diff > 0 ? `+${diff.toFixed(1).replace(/\.0$/, '')} kg` : '+2.5 kg';
        return {
          id: def.id,
          name: def.name,
          weight: recorded.weight,
          reps: recorded.reps,
          unit: 'kg',
          increase: incText,
          isCustom: true
        };
      }
      return def;
    });
  };

  const compoundPRs = getCompoundPRs();
  const totalPages = Math.ceil(compoundPRs.length / 2);

  // Auto-swap interval logic (swaps every 3.5 seconds)
  useEffect(() => {
    if (isPaused || totalPages <= 1) return;

    const timer = setInterval(() => {
      triggerPageChange((prev) => (prev + 1) % totalPages);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, totalPages]);

  const triggerPageChange = (nextPageFn: (prev: number) => number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(nextPageFn);
      setIsAnimating(false);
    }, 150);
  };

  const handlePrev = () => {
    triggerPageChange((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleNext = () => {
    triggerPageChange((prev) => (prev + 1) % totalPages);
  };

  // Get current 2 visible compound workouts
  const visiblePRs = [
    compoundPRs[currentPage * 2],
    compoundPRs[currentPage * 2 + 1]
  ].filter(Boolean);

  return (
    <div
      className="bg-gym-card border border-gym-border/80 rounded-3xl p-5 shadow-xl select-none transition-all duration-300 relative overflow-hidden group hover:border-amber-500/40"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background ambient glow effect */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl leading-none animate-bounce" style={{ animationDuration: '3s' }}>
            🏆
          </span>
          <h3 className="text-base font-black tracking-wider text-amber-400 uppercase font-sans">
            RECENT PRs
          </h3>
        </div>

        {/* Page / Auto-swap Status Controls */}
        <div className="flex items-center gap-2">
          {/* Pause / Live Indicator */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-amber-300 transition-colors"
            title={isPaused ? "Resume auto-swap" : "Pause auto-swap"}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`} />
            <span>{isPaused ? 'PAUSED' : 'SWAPPING'}</span>
          </button>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={handlePrev}
              className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all active:scale-95"
              aria-label="Previous PRs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-slate-400 px-1">
              {currentPage + 1}/{totalPages}
            </span>
            <button
              onClick={handleNext}
              className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all active:scale-95"
              aria-label="Next PRs"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2 Visible Primary Compound Workouts Container */}
      <div className="min-h-[96px] flex flex-col justify-center gap-3 relative">
        <div
          className={`space-y-3 transition-all duration-300 transform ${
            isAnimating ? 'opacity-0 translateY-2 scale-[0.99]' : 'opacity-100 translateY-0 scale-100 animate-swap-in'
          }`}
        >
          {visiblePRs.map((pr) => (
            <div
              key={pr.id}
              className="flex items-center justify-between bg-slate-950/40 hover:bg-slate-900/60 border border-slate-800/60 hover:border-amber-500/30 rounded-2xl px-4 py-2.5 transition-all duration-200 group/row"
            >
              {/* Left Column: Exercise Name */}
              <div className="w-2/5 min-w-0 pr-2">
                <span className="text-sm sm:text-base font-bold text-slate-100 group-hover/row:text-amber-300 transition-colors truncate block">
                  {pr.name}
                </span>
              </div>

              {/* Center Column: Weight x Reps */}
              <div className="w-2/5 text-center font-mono">
                <span className="text-sm sm:text-base font-extrabold text-slate-200">
                  {pr.weight} {pr.unit} <span className="text-slate-400 font-sans font-medium text-xs sm:text-sm">×</span> {pr.reps}
                </span>
              </div>

              {/* Right Column: Weight Delta / Increase */}
              <div className="w-1/5 text-right">
                <span className="text-xs sm:text-sm font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg inline-block shadow-sm">
                  {pr.increase}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Indicator Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3 pt-1 border-t border-slate-800/40">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => triggerPageChange(() => idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentPage ? 'w-5 bg-amber-400 shadow-sm shadow-amber-950' : 'w-1.5 bg-slate-800 hover:bg-slate-700'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
