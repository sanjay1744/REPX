import React from 'react';
import { X, Check } from 'lucide-react';

interface MuscleGroupSheetProps {
  isOpen: boolean;
  selectedMuscles: string[];
  totalResultsCount: number;
  onSelectMuscle: (muscle: string) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

const MUSCLE_GROUPS = [
  { name: 'Abdominals', category: 'Upper Body', icon: '🧘' },
  { name: 'Biceps', category: 'Upper Body', icon: '💪' },
  { name: 'Chest', category: 'Upper Body', icon: '🏋️' },
  { name: 'Forearms', category: 'Upper Body', icon: '✊' },
  { name: 'Lats', category: 'Upper Body', icon: '🦇' },
  { name: 'Lower Back', category: 'Upper Body', icon: '🧍' },
  { name: 'Neck', category: 'Upper Body', icon: '👤' },
  { name: 'Shoulders', category: 'Upper Body', icon: '🛡️' },
  { name: 'Traps', category: 'Upper Body', icon: '📐' },
  { name: 'Triceps', category: 'Upper Body', icon: '⚡' },
  { name: 'Upper Back', category: 'Upper Body', icon: '🏹' },
  { name: 'Calves', category: 'Lower Body', icon: '🦵' },
  { name: 'Glutes', category: 'Lower Body', icon: '🍑' },
  { name: 'Hamstrings', category: 'Lower Body', icon: '🏃' },
  { name: 'Quads', category: 'Lower Body', icon: '🦵' }
];

export const MuscleGroupSheet: React.FC<MuscleGroupSheetProps> = ({
  isOpen,
  selectedMuscles,
  totalResultsCount,
  onSelectMuscle,
  onClearFilters,
  onClose
}) => {
  if (!isOpen) return null;

  const upperBody = MUSCLE_GROUPS.filter((m) => m.category === 'Upper Body');
  const lowerBody = MUSCLE_GROUPS.filter((m) => m.category === 'Lower Body');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end animate-fade-in">
      <div
        className="w-full max-w-md mx-auto sm:max-w-xl bg-[#121216] border-t border-white/15 rounded-t-3xl p-4 sm:p-5 max-h-[85vh] flex flex-col shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle Bar */}
        <div className="w-12 h-1 bg-zinc-600 rounded-full mx-auto mb-3 cursor-pointer" onClick={onClose} />

        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-black text-white">Muscle Group</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Grid of Muscle Tiles */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1 pr-1 scrollbar-thin">
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">Upper Body</h4>
            <div className="grid grid-cols-2 gap-2.5">
              {upperBody.map((m) => {
                const isSelected = selectedMuscles.includes(m.name);
                return (
                  <button
                    key={m.name}
                    onClick={() => onSelectMuscle(m.name)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'glass-input border-white/10 text-zinc-200 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl flex items-center justify-center w-8 h-8 rounded-xl bg-white/5">
                      {m.icon}
                    </span>
                    <span className="text-xs font-bold flex-1 truncate">{m.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">Lower Body</h4>
            <div className="grid grid-cols-2 gap-2.5">
              {lowerBody.map((m) => {
                const isSelected = selectedMuscles.includes(m.name);
                return (
                  <button
                    key={m.name}
                    onClick={() => onSelectMuscle(m.name)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'glass-input border-white/10 text-zinc-200 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl flex items-center justify-center w-8 h-8 rounded-xl bg-white/5">
                      {m.icon}
                    </span>
                    <span className="text-xs font-bold flex-1 truncate">{m.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center gap-3">
          <button
            onClick={onClearFilters}
            className="flex-1 glass-input hover:bg-white/10 text-zinc-300 py-3 rounded-2xl text-xs font-bold transition-all"
          >
            Clear Filters
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl text-xs font-black shadow-lg transition-all"
          >
            Show {totalResultsCount} results
          </button>
        </div>
      </div>
    </div>
  );
};
