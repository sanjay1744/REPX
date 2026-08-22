import React, { useState } from 'react';
import { X, Dumbbell, Plus, Trash2 } from 'lucide-react';
import { AddExerciseModal } from './AddExerciseModal';
import { ExerciseDefinition } from '../../data/exerciseDatabase';
import { ExerciseTarget } from '../../types';

interface CreateRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRoutine: (name: string, exercises: ExerciseTarget[]) => void;
}

export const CreateRoutineModal: React.FC<CreateRoutineModalProps> = ({
  isOpen,
  onClose,
  onSaveRoutine
}) => {
  const [routineTitle, setRoutineTitle] = useState('');
  const [bannerVisible, setBannerVisible] = useState(true);
  const [exercises, setExercises] = useState<ExerciseTarget[]>([]);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleAddExerciseDefinition = (exDef: ExerciseDefinition) => {
    const newExTarget: ExerciseTarget = {
      id: `ex-target-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      exerciseId: exDef.id,
      name: exDef.name,
      muscleGroup: exDef.muscleGroup,
      equipment: exDef.equipment,
      order: exercises.length + 1,
      targetSets: 3,
      minReps: 8,
      maxReps: 12,
      restSeconds: 90
    };
    setExercises([...exercises, newExTarget]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    if (!routineTitle.trim()) {
      alert('Please enter a routine title');
      return;
    }
    if (exercises.length === 0) {
      alert('Please add at least one exercise to your routine');
      return;
    }
    onSaveRoutine(routineTitle.trim(), exercises);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#08080C] flex flex-col max-w-md mx-auto sm:max-w-xl animate-fade-in">
      {/* Top Header Bar */}
      <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#08080C]">
        <button onClick={onClose} className="text-sm font-bold text-blue-400 hover:text-blue-300">
          Cancel
        </button>
        <h2 className="text-base font-black text-white">Create Routine</h2>
        <button
          onClick={handleSave}
          className="bg-white hover:bg-zinc-200 text-black px-4 py-1.5 rounded-xl text-xs font-black transition-all shadow-md"
        >
          Save
        </button>
      </div>

      {/* Yellow Help Banner */}
      {bannerVisible && (
        <div className="bg-[#FEF08A] text-black px-4 py-2.5 text-xs font-extrabold flex items-center justify-between">
          <span>You're creating a Routine. Tap for help...</span>
          <button onClick={() => setBannerVisible(false)} className="p-0.5 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {/* Routine Title Input */}
        <div>
          <input
            type="text"
            placeholder="Routine title"
            value={routineTitle}
            onChange={(e) => setRoutineTitle(e.target.value)}
            className="w-full bg-transparent text-xl font-black text-white border-b border-white/15 pb-2 focus:outline-none focus:border-white placeholder-zinc-500"
          />
        </div>

        {/* Empty State vs Exercises List */}
        {exercises.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl glass-input flex items-center justify-center mx-auto text-white shadow-xl">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-zinc-400 font-medium max-w-xs mx-auto">
              Get started by adding an exercise to your routine.
            </p>
            <button
              onClick={() => setIsAddExerciseModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add exercise</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((ex, idx) => (
              <div key={ex.id} className="glass-panel rounded-2xl p-4 space-y-3 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white">{ex.name}</h4>
                    <span className="text-xs text-zinc-400 font-semibold">{ex.muscleGroup}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveExercise(idx)}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="glass-input rounded-xl p-2">
                    <span className="text-[10px] text-zinc-400 block font-bold">Target Sets</span>
                    <span className="font-black text-white text-sm">{ex.targetSets}</span>
                  </div>
                  <div className="glass-input rounded-xl p-2">
                    <span className="text-[10px] text-zinc-400 block font-bold">Min Reps</span>
                    <span className="font-black text-white text-sm">{ex.minReps}</span>
                  </div>
                  <div className="glass-input rounded-xl p-2">
                    <span className="text-[10px] text-zinc-400 block font-bold">Max Reps</span>
                    <span className="font-black text-white text-sm">{ex.maxReps}</span>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => setIsAddExerciseModalOpen(true)}
              className="w-full glass-input hover:bg-white/10 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 border border-dashed border-white/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add another exercise</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        isOpen={isAddExerciseModalOpen}
        onClose={() => setIsAddExerciseModalOpen(false)}
        onSelectExercise={handleAddExerciseDefinition}
      />
    </div>
  );
};
