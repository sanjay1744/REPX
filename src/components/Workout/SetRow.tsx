import React from 'react';
import type { SetLog } from '../../types';
import { Check, Trophy } from 'lucide-react';

interface SetRowProps {
  setLog: SetLog;
  previousWeight?: number;
  previousReps?: number;
  onUpdate: (weight: number, reps: number, rir?: number) => void;
  onToggleComplete: () => void;
  onDelete?: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  setLog,
  previousWeight,
  previousReps,
  onUpdate,
  onToggleComplete,
  onDelete
}) => {
  return (
    <div
      className={`grid grid-cols-12 gap-1.5 sm:gap-2 items-center px-2.5 py-1.5 rounded-xl border transition-all duration-200 ${
        setLog.completed
          ? 'bg-[#0E1626]/80 border-blue-500/30 shadow-sm'
          : 'bg-[#12121A]/60 border-white/[0.08] hover:border-white/15'
      }`}
    >
      {/* SET number column */}
      <div className="col-span-2 flex items-center gap-1.5">
        <span
          className={`w-6 h-6 rounded-md flex items-center justify-center font-extrabold text-[11px] transition-colors ${
            setLog.completed
              ? 'bg-[#007AFF] text-white shadow-sm'
              : 'bg-white/10 text-zinc-300'
          }`}
        >
          {setLog.setNumber}
        </span>
        {setLog.isPR && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded border border-amber-400/20">
            <Trophy className="w-2.5 h-2.5" />
            PR
          </span>
        )}
      </div>

      {/* PREVIOUS column */}
      <div className="col-span-3 text-center text-xs font-semibold text-zinc-400 tabular-nums">
        {previousWeight !== undefined && previousReps !== undefined
          ? `${previousWeight}kg × ${previousReps}`
          : '—'}
      </div>

      {/* KG Input Box */}
      <div className="col-span-3 flex justify-center">
        <div
          className={`w-16 sm:w-20 h-8 flex items-center justify-center rounded-lg border transition-all ${
            setLog.completed
              ? 'bg-blue-500/10 border-blue-500/30'
              : 'bg-[#181822] border-white/15 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 hover:border-white/30'
          }`}
        >
          <input
            type="number"
            value={setLog.weight || ''}
            placeholder="0"
            onChange={(e) => onUpdate(parseFloat(e.target.value) || 0, setLog.reps, setLog.rir)}
            className="w-full bg-transparent text-center text-xs sm:text-sm font-bold text-white outline-none tabular-nums px-1"
            step="0.5"
          />
        </div>
      </div>

      {/* REPS Input Box */}
      <div className="col-span-2 flex justify-center">
        <div
          className={`w-14 sm:w-16 h-8 flex items-center justify-center rounded-lg border transition-all ${
            setLog.completed
              ? 'bg-blue-500/10 border-blue-500/30'
              : 'bg-[#181822] border-white/15 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 hover:border-white/30'
          }`}
        >
          <input
            type="number"
            value={setLog.reps || ''}
            placeholder="0"
            onChange={(e) => onUpdate(setLog.weight, parseInt(e.target.value) || 0, setLog.rir)}
            className="w-full bg-transparent text-center text-xs sm:text-sm font-bold text-white outline-none tabular-nums px-1"
          />
        </div>
      </div>

      {/* CHECKMARK Toggle */}
      <div className="col-span-2 flex items-center justify-end">
        <button
          onClick={onToggleComplete}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            setLog.completed
              ? 'bg-[#007AFF] text-white shadow-md scale-105'
              : 'bg-white/10 text-zinc-500 hover:text-white hover:bg-white/20'
          }`}
        >
          <Check className={`w-3.5 h-3.5 ${setLog.completed ? 'stroke-[3.5]' : ''}`} />
        </button>
      </div>
    </div>
  );
};


