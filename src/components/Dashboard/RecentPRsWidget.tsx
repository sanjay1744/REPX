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
      className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-5 select-none transition-all duration-300 relative overflow-hidden group border border-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl glass-input border border-white/15 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
            🏆
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black tracking-wider text-white uppercase font-sans">
              PERSONAL RECORDS TICKER
            </h3>
            <p className="text-[8px] sm:text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Top Compound Benchmarks</p>
          </div>
        </div>

        {/* Page / Auto-swap Status Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Pause / Live Indicator */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full glass-input text-zinc-300 hover:text-white transition-colors"
            title={isPaused ? "Resume auto-swap" : "Pause auto-swap"}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-zinc-500' : 'bg-white animate-ping'}`} />
            <span>{isPaused ? 'PAUSED' : 'LIVE'}</span>
          </button>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-0.5 text-zinc-400">
            <button
              onClick={handlePrev}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg glass-input flex items-center justify-center hover:text-white transition-all active:scale-95"
              aria-label="Previous PRs"
            >
              <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <span className="text-[9px] sm:text-[10px] font-mono font-extrabold text-zinc-400 px-0.5">
              {currentPage + 1}/{totalPages}
            </span>
            <button
              onClick={handleNext}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg glass-input flex items-center justify-center hover:text-white transition-all active:scale-95"
              aria-label="Next PRs"
            >
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2 Visible Primary Compound Workouts Container */}
      <div className="min-h-[84px] sm:min-h-[96px] flex flex-col justify-center gap-2.5 relative z-10">
        <div
          className={`space-y-2 transition-all duration-300 transform ${
            isAnimating ? 'opacity-0 translateY-2 scale-[0.99]' : 'opacity-100 translateY-0 scale-100 animate-swap-in'
          }`}
        >
          {visiblePRs.map((pr) => (
            <div
              key={pr.id}
              className="flex items-center justify-between glass-input hover:border-white/20 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 transition-all duration-200 group/row"
            >
              {/* Left Column: Exercise Name */}
              <div className="w-2/5 min-w-0 pr-1">
                <span className="text-xs sm:text-sm font-bold text-white transition-colors truncate block">
                  {pr.name}
                </span>
              </div>

              {/* Center Column: Weight x Reps */}
              <div className="w-2/5 text-center font-mono">
                <span className="text-xs sm:text-sm font-black text-white">
                  {pr.weight} {pr.unit} <span className="text-zinc-400 font-sans font-medium text-[10px] sm:text-xs">×</span> {pr.reps}
                </span>
              </div>

              {/* Right Column: Weight Delta / Increase */}
              <div className="w-1/5 text-right">
                <span className="text-[10px] sm:text-xs font-black text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded-lg sm:rounded-xl inline-block">
                  {pr.increase}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Indicator Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5 pt-2 border-t border-white/[0.08] relative z-10">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => triggerPageChange(() => idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentPage ? 'w-4 sm:w-5 bg-white shadow-sm' : 'w-1.5 bg-zinc-800 hover:bg-zinc-700'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
