import React from 'react';
import type { SetLog } from '../../types';
import { getProgressionRecommendation } from '../../services/progressionEngine';
import { Flame, Target, TrendingUp, Sparkles } from 'lucide-react';

interface BeatLastTimeCardProps {
  exerciseName: string;
  minReps: number;
  maxReps: number;
  previousSets?: SetLog[];
}

export const BeatLastTimeCard: React.FC<BeatLastTimeCardProps> = ({
  exerciseName,
  minReps,
  maxReps,
  previousSets = []
}) => {
  const recommendation = getProgressionRecommendation(exerciseName, minReps, maxReps, previousSets);
  const topPreviousSet = previousSets.filter((s) => s.completed && s.weight > 0).sort((a, b) => b.weight - a.weight)[0];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-gym-card to-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Beat Last Time Target
          </span>
        </div>
        {recommendation.status === 'increase_weight' && (
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            +WEIGHT LOAD
          </span>
        )}
        {recommendation.status === 'increase_reps' && (
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            +1 REP TARGET
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
          <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Previous Session</div>
          {topPreviousSet ? (
            <div className="text-lg font-black text-slate-200">
              {topPreviousSet.weight} <span className="text-xs font-medium text-slate-400">kg</span> × {topPreviousSet.reps} <span className="text-xs font-medium text-slate-400">reps</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic py-1">No previous logs yet</div>
          )}
        </div>

        <div className="bg-emerald-950/30 rounded-xl p-3 border border-emerald-500/30">
          <div className="text-[10px] font-semibold text-emerald-400 uppercase mb-1 flex items-center gap-1">
            <Target className="w-3 h-3" /> Today's Goal
          </div>
          <div className="text-lg font-black text-emerald-300">
            {recommendation.targetWeight > 0 ? (
              <>
                {recommendation.targetWeight} <span className="text-xs font-medium text-emerald-400">kg</span> × {recommendation.targetReps} <span className="text-xs font-medium text-emerald-400">reps</span>
              </>
            ) : (
              <>{recommendation.targetReps} reps</>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-300 bg-slate-800/40 rounded-lg p-2 border border-slate-800/80">
        💡 {recommendation.reason}
      </p>
    </div>
  );
};
