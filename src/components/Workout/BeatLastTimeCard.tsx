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
    <div className="glass-panel border-white/10 rounded-2xl p-3.5 sm:p-4 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl glass-input border border-white/15 text-white flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">
            BEAT LAST TIME TARGET
          </span>
        </div>
        {recommendation.status === 'increase_weight' && (
          <span className="inline-flex items-center gap-1 bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded-full text-[9px] font-black shadow-sm">
            <Sparkles className="w-3 h-3 text-white" />
            +WEIGHT LOAD
          </span>
        )}
        {recommendation.status === 'increase_reps' && (
          <span className="inline-flex items-center gap-1 bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded-full text-[9px] font-black shadow-sm">
            <TrendingUp className="w-3 h-3 text-white" />
            +1 REP TARGET
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-2.5">
        <div className="glass-input rounded-xl p-2.5 sm:p-3">
          <div className="text-[9px] sm:text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider mb-0.5">Previous Session</div>
          {topPreviousSet ? (
            <div className="text-base sm:text-lg font-black text-white">
              {topPreviousSet.weight} <span className="text-[10px] sm:text-xs font-medium text-zinc-400">kg</span> × {topPreviousSet.reps} <span className="text-[10px] sm:text-xs font-medium text-zinc-400">reps</span>
            </div>
          ) : (
            <div className="text-[11px] text-zinc-500 italic py-0.5">No previous logs yet</div>
          )}
        </div>

        <div className="glass-card-active rounded-xl p-2.5 sm:p-3 border border-white/30">
          <div className="text-[9px] sm:text-[10px] font-extrabold text-white uppercase tracking-wider mb-0.5 flex items-center gap-1">
            <Target className="w-3 h-3 text-white" /> Today's Goal
          </div>
          <div className="text-base sm:text-lg font-black text-white">
            {recommendation.targetWeight > 0 ? (
              <>
                {recommendation.targetWeight} <span className="text-[10px] sm:text-xs font-medium text-zinc-300">kg</span> × {recommendation.targetReps} <span className="text-[10px] sm:text-xs font-medium text-zinc-300">reps</span>
              </>
            ) : (
              <>{recommendation.targetReps} reps</>
            )}
          </div>
        </div>
      </div>

      <p className="text-[11px] sm:text-xs text-zinc-300 glass-input rounded-xl p-2 sm:p-2.5 border border-white/[0.08]">
        💡 {recommendation.reason}
      </p>
    </div>
  );
};
