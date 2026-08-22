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
      className={`grid grid-cols-12 gap-1.5 sm:gap-2 items-center p-2 rounded-xl border transition-all duration-200 ${
        setLog.completed
          ? 'bg-[#181824] border-white/20 shadow-md'
          : 'bg-black/30 border-white/10 hover:border-white/20'
      }`}
    >
      {/* SET number column */}
      <div className="col-span-2 flex items-center gap-1">
        <span
          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-black text-xs ${
            setLog.completed ? 'bg-white text-black' : 'bg-white/10 text-white'
          }`}
        >
          {setLog.setNumber}
        </span>
        {setLog.isPR && (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-yellow-400">
            <Trophy className="w-2.5 h-2.5" />
            PR
          </span>
        )}
      </div>

      {/* PREVIOUS column */}
      <div className="col-span-3 text-center text-xs font-semibold text-zinc-400">
        {previousWeight !== undefined && previousReps !== undefined
          ? `${previousWeight}kg × ${previousReps}`
          : '-'}
      </div>

      {/* KG Input Box */}
      <div className="col-span-3 flex items-center justify-center bg-[#121218] border border-white/15 rounded-lg px-2 py-1 focus-within:border-blue-500 transition-colors">
        <input
          type="number"
          value={setLog.weight || ''}
          placeholder="0"
          onChange={(e) => onUpdate(parseFloat(e.target.value) || 0, setLog.reps, setLog.rir)}
          className="w-full bg-transparent text-center text-xs sm:text-sm font-extrabold text-white outline-none"
          step="0.5"
        />
      </div>

      {/* REPS Input Box */}
      <div className="col-span-2 flex items-center justify-center bg-[#121218] border border-white/15 rounded-lg px-2 py-1 focus-within:border-blue-500 transition-colors">
        <input
          type="number"
          value={setLog.reps || ''}
          placeholder="0"
          onChange={(e) => onUpdate(setLog.weight, parseInt(e.target.value) || 0, setLog.rir)}
          className="w-full bg-transparent text-center text-xs sm:text-sm font-extrabold text-white outline-none"
        />
      </div>

      {/* CHECKMARK Toggle */}
      <div className="col-span-2 flex items-center justify-end">
        <button
          onClick={onToggleComplete}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all ${
            setLog.completed
              ? 'bg-[#007AFF] text-white shadow-md scale-105'
              : 'bg-white/10 text-zinc-500 hover:text-white hover:bg-white/20'
          }`}
        >
          <Check className={`w-4 h-4 ${setLog.completed ? 'stroke-[3.5]' : ''}`} />
        </button>
      </div>
    </div>
  );
};
