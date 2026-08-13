import React from 'react';
import type { SetLog } from '../../types';
import { Check, Trophy, Plus, Minus, Trash2 } from 'lucide-react';

interface SetRowProps {
  setLog: SetLog;
  onUpdate: (weight: number, reps: number, rir?: number) => void;
  onToggleComplete: () => void;
  onDelete?: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({ setLog, onUpdate, onToggleComplete, onDelete }) => {
  const handleWeightChange = (delta: number) => {
    const nextWeight = Math.max(0, Math.round((setLog.weight + delta) * 10) / 10);
    onUpdate(nextWeight, setLog.reps, setLog.rir);
  };

  const handleRepsChange = (delta: number) => {
    const nextReps = Math.max(0, setLog.reps + delta);
    onUpdate(setLog.weight, nextReps, setLog.rir);
  };

  return (
    <div
      className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all ${
        setLog.completed
          ? 'bg-emerald-950/20 border-emerald-500/40'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
            setLog.completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}
        >
          {setLog.setNumber}
        </div>
        {setLog.isPR && (
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded text-[9px] font-bold animate-pulse">
            <Trophy className="w-3 h-3 text-amber-400" />
            PR
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 bg-slate-950/80 rounded-lg p-1 border border-slate-800">
        <button
          onClick={() => handleWeightChange(-2.5)}
          className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <Minus className="w-3 h-3" />
        </button>
        <div className="flex items-center gap-1 px-1">
          <input
            type="number"
            value={setLog.weight}
            onChange={(e) => onUpdate(parseFloat(e.target.value) || 0, setLog.reps, setLog.rir)}
            className="w-12 bg-transparent text-center text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
            step="0.5"
          />
          <span className="text-[10px] text-slate-400 font-medium">kg</span>
        </div>
        <button
          onClick={() => handleWeightChange(2.5)}
          className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-1 bg-slate-950/80 rounded-lg p-1 border border-slate-800">
        <button
          onClick={() => handleRepsChange(-1)}
          className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <Minus className="w-3 h-3" />
        </button>
        <div className="flex items-center gap-1 px-1">
          <input
            type="number"
            value={setLog.reps}
            onChange={(e) => onUpdate(setLog.weight, parseInt(e.target.value) || 0, setLog.rir)}
            className="w-10 bg-transparent text-center text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
          />
          <span className="text-[10px] text-slate-400 font-medium">reps</span>
        </div>
        <button
          onClick={() => handleRepsChange(1)}
          className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onToggleComplete}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            setLog.completed
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-md shadow-emerald-950 scale-105'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
          }`}
        >
          <Check className={`w-5 h-5 ${setLog.completed ? 'stroke-[3]' : ''}`} />
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Set"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
