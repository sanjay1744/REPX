import React, { useState, useMemo } from 'react';
import { Search, Info, Plus, ChevronDown } from 'lucide-react';
import type { ExerciseDefinition } from '../../types';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { MuscleGroupSheet } from './MuscleGroupSheet';
import { EquipmentSheet } from './EquipmentSheet';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseDefinition) => void;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise
}) => {
  const { exerciseDatabase, createCustomExercise } = useWorkoutStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [isMuscleSheetOpen, setIsMuscleSheetOpen] = useState(false);
  const [isEquipmentSheetOpen, setIsEquipmentSheetOpen] = useState(false);

  const filteredExercises = useMemo(() => {
    return exerciseDatabase.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscle = selectedMuscles.length === 0 || selectedMuscles.includes(ex.muscleGroup);
      const matchesEquipment = selectedEquipment.length === 0 || selectedEquipment.includes(ex.equipment);
      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [exerciseDatabase, searchQuery, selectedMuscles, selectedEquipment]);

  if (!isOpen) return null;


  const handleToggleMuscle = (muscle: string) => {
    if (selectedMuscles.includes(muscle)) {
      setSelectedMuscles(selectedMuscles.filter((m) => m !== muscle));
    } else {
      setSelectedMuscles([...selectedMuscles, muscle]);
    }
  };

  const handleToggleEquipment = (equip: string) => {
    if (selectedEquipment.includes(equip)) {
      setSelectedEquipment(selectedEquipment.filter((e) => e !== equip));
    } else {
      setSelectedEquipment([...selectedEquipment, equip]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#08080C] flex flex-col max-w-md mx-auto sm:max-w-xl animate-fade-in">
      {/* Top Header Bar */}
      <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#08080C]">
        <button onClick={onClose} className="text-sm font-bold text-blue-400 hover:text-blue-300">
          Cancel
        </button>
        <h2 className="text-base font-black text-white">Add Exercise</h2>
        <button
          onClick={async () => {
            const customName = prompt('Enter custom exercise name:');
            if (customName) {
              const newEx: ExerciseDefinition = {
                id: `custom-${Date.now()}`,
                name: customName,
                muscleGroup: 'Chest',
                category: 'Upper Body',
                equipment: 'Barbell'
              };
              await createCustomExercise(newEx);
              onSelectExercise(newEx);
              onClose();
            }
          }}
          className="text-sm font-bold text-blue-400 hover:text-blue-300"
        >
          Create
        </button>
      </div>

      {/* Search Bar & Filter Buttons */}
      <div className="p-4 space-y-3 bg-[#08080C] border-b border-white/5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exercise"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input text-white text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-white/10 focus:outline-none focus:ring-1 focus:ring-white placeholder-zinc-500 font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEquipmentSheetOpen(true)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl text-xs font-extrabold border transition-all ${
              selectedEquipment.length > 0
                ? 'bg-blue-600/20 border-blue-500 text-white'
                : 'glass-input border-white/10 text-zinc-300 hover:border-white/20'
            }`}
          >
            <span>{selectedEquipment.length > 0 ? `${selectedEquipment.length} Equip` : 'All Equipment'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          <button
            onClick={() => setIsMuscleSheetOpen(true)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl text-xs font-extrabold border transition-all ${
              selectedMuscles.length > 0
                ? 'bg-blue-600/20 border-blue-500 text-white'
                : 'glass-input border-white/10 text-zinc-300 hover:border-white/20'
            }`}
          >
            <span>{selectedMuscles.length > 0 ? `${selectedMuscles.length} Muscles` : 'All Muscles'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
        <div className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider mb-2">
          {searchQuery || selectedMuscles.length || selectedEquipment.length ? 'Filtered Results' : 'Popular Exercises'} ({filteredExercises.length})
        </div>

        {filteredExercises.map((ex) => (
          <div
            key={ex.id}
            onClick={() => {
              onSelectExercise(ex);
              onClose();
            }}
            className="flex items-center justify-between p-3 rounded-2xl glass-input border border-white/5 hover:border-white/20 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              {/* Exercise Avatar Graphic */}
              <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                🏋️
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  {ex.name}
                </h4>
                <span className="text-xs font-medium text-zinc-400">
                  {ex.muscleGroup} • {ex.equipment}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                alert(`${ex.name}\nTarget Muscle: ${ex.muscleGroup}\nEquipment: ${ex.equipment}`);
              }}
              className="w-8 h-8 rounded-full glass-input flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Muscle Group Filter Sheet */}
      <MuscleGroupSheet
        isOpen={isMuscleSheetOpen}
        selectedMuscles={selectedMuscles}
        totalResultsCount={filteredExercises.length}
        onSelectMuscle={handleToggleMuscle}
        onClearFilters={() => setSelectedMuscles([])}
        onClose={() => setIsMuscleSheetOpen(false)}
      />

      {/* Equipment Filter Sheet */}
      <EquipmentSheet
        isOpen={isEquipmentSheetOpen}
        selectedEquipment={selectedEquipment}
        totalResultsCount={filteredExercises.length}
        onSelectEquipment={handleToggleEquipment}
        onClearFilters={() => setSelectedEquipment([])}
        onClose={() => setIsEquipmentSheetOpen(false)}
      />
    </div>
  );
};
