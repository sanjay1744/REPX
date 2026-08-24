import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface EquipmentSheetProps {
  isOpen: boolean;
  selectedEquipment: string[];
  totalResultsCount: number;
  onSelectEquipment: (item: string) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

const EQUIPMENT_ITEMS = [
  { name: 'None', icon: '🏃' },
  { name: 'Barbell', icon: '🏋️' },
  { name: 'Dumbbell', icon: '🔔' },
  { name: 'Kettlebell', icon: '🥊' },
  { name: 'Machine', icon: '⚙️' },
  { name: 'Plate', icon: '🔘' },
  { name: 'Resistance Band', icon: '🎗️' },
  { name: 'Suspension Band', icon: '🪢' },
  { name: 'Cable', icon: '🔌' },
  { name: 'Other', icon: '💬' }
];

export const EquipmentSheet: React.FC<EquipmentSheetProps> = ({
  isOpen,
  selectedEquipment,
  totalResultsCount,
  onSelectEquipment,
  onClearFilters,
  onClose
}) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSmoothClose = (callback?: () => void) => {
    setIsVisible(false);
    setTimeout(() => {
      if (callback) callback();
      onClose();
    }, 320);
  };

  if (!isRendered) return null;

  return (
    <div
      onClick={() => handleSmoothClose()}
      className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end sheet-backdrop ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`w-full max-w-md mx-auto sm:max-w-xl bg-[#121216] border-t border-white/15 rounded-t-3xl p-4 sm:p-5 max-h-[85vh] flex flex-col shadow-2xl relative sheet-panel ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-full scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle Bar */}
        <div className="w-12 h-1 bg-zinc-600 rounded-full mx-auto mb-3 cursor-pointer hover:bg-zinc-400 transition-colors" onClick={() => handleSmoothClose()} />

        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-black text-white">Equipment</h3>
          <button onClick={() => handleSmoothClose()} className="text-zinc-400 hover:text-white p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Grid of Equipment Tiles */}
        <div className="overflow-y-auto py-4 flex-1 pr-1 scrollbar-thin">
          <div className="grid grid-cols-2 gap-2.5">
            {EQUIPMENT_ITEMS.map((item) => {
              const isSelected = selectedEquipment.includes(item.name);
              return (
                <button
                  key={item.name}
                  onClick={() => onSelectEquipment(item.name)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                      : 'glass-input border-white/10 text-zinc-200 hover:border-white/20'
                  }`}
                >
                  <span className="text-xl flex items-center justify-center w-8 h-8 rounded-xl bg-white/5">
                    {item.icon}
                  </span>
                  <span className="text-xs font-bold flex-1 truncate">{item.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                </button>
              );
            })}
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
            onClick={() => handleSmoothClose()}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl text-xs font-black shadow-lg transition-all"
          >
            Show {totalResultsCount} results
          </button>
        </div>
      </div>
    </div>
  );
};
