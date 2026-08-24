import React, { useState, useEffect } from 'react';
import type { ExerciseLog, ExerciseDefinition } from '../../types';
import { useWorkoutStore } from '../../store/useWorkoutStore';

import {
  ArrowUpDown,
  RefreshCw,
  Plus,
  X,
  Dumbbell,
  Search,
  MinusCircle,
  Menu,
  ChevronRight,
  Info
} from 'lucide-react';


interface ExerciseMenuSheetProps {
  isOpen: boolean;
  exercise: ExerciseLog | null;
  allExercises: ExerciseLog[];
  onClose: () => void;
  onRemoveExercise: (exerciseId: string) => void;
  onReplaceExercise: (oldExerciseId: string, newExDef: ExerciseDefinition) => void;
  onReorderExercises: (reordered: ExerciseLog[]) => void;
}

export const ExerciseMenuSheet: React.FC<ExerciseMenuSheetProps> = ({
  isOpen,
  exercise,
  allExercises,
  onClose,
  onRemoveExercise,
  onReplaceExercise,
  onReorderExercises
}) => {
  const { exerciseDatabase } = useWorkoutStore();
  const [activeModal, setActiveModal] = useState<'menu' | 'reorder' | 'replace'>('menu');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('All');
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState<string>('All');
  const [reorderedList, setReorderedList] = useState<ExerciseLog[]>(allExercises);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Smooth popup & popdown animation mounting lifecycle
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen && exercise) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, exercise]);

  const handleSmoothClose = (callback?: () => void) => {
    setIsVisible(false);
    setTimeout(() => {
      if (callback) callback();
      onClose();
    }, 320);
  };

  if (!isRendered || !exercise) return null;

  // Handle drag and drop reorder
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newList = [...reorderedList];
    const draggedItem = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setReorderedList(newList);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleRemoveFromReorder = (exId: string) => {
    const newList = reorderedList.filter((e) => e.exerciseId !== exId);
    setReorderedList(newList);
  };

  const handleSaveReorder = () => {
    onReorderExercises(reorderedList);
    setActiveModal('menu');
    handleSmoothClose();
  };

  // Filter exercises for replace modal
  const filteredDatabase = exerciseDatabase.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscleFilter === 'All' || ex.muscleGroup.toLowerCase() === selectedMuscleFilter.toLowerCase();
    const matchesEquipment = selectedEquipmentFilter === 'All' || ex.equipment.toLowerCase() === selectedEquipmentFilter.toLowerCase();
    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  const suggestedList = filteredDatabase.slice(0, 3);
  const popularList = filteredDatabase.slice(3);

  return (
    <div
      onClick={() => handleSmoothClose()}
      className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 sheet-backdrop ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* 1. MAIN MENU BOTTOM SHEET */}
      {activeModal === 'menu' && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`bg-[#121218] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl sheet-panel ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-full sm:translate-y-12 scale-95'
          }`}
        >
          {/* Drag handle */}
          <div className="w-12 h-1.5 bg-zinc-600 rounded-full mx-auto mb-2 cursor-pointer hover:bg-zinc-400 transition-colors" onClick={() => handleSmoothClose()} />

          {/* Exercise Info Title Header */}
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5 text-black" />
            </div>
            <div>
              <h4 className="text-base font-black text-white">{exercise.exerciseName}</h4>
              <p className="text-xs text-zinc-400 font-medium">{exercise.muscleGroup}</p>
            </div>
          </div>

          {/* Menu Options */}
          <div className="space-y-1">
            {/* Reorder Exercises */}
            <button
              onClick={() => {
                setReorderedList(allExercises);
                setActiveModal('reorder');
              }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-white/10 transition-colors text-left text-white text-sm font-bold"
            >
              <ArrowUpDown className="w-5 h-5 text-zinc-300" />
              <span>Reorder Exercises</span>
            </button>

            <div className="h-px bg-white/5 mx-2" />

            {/* Replace Exercise */}
            <button
              onClick={() => setActiveModal('replace')}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-white/10 transition-colors text-left text-white text-sm font-bold"
            >
              <RefreshCw className="w-5 h-5 text-zinc-300" />
              <span>Replace Exercise</span>
            </button>

            <div className="h-px bg-white/5 mx-2" />

            {/* Add To Superset */}
            <button
              onClick={() => {
                alert(`Added ${exercise.exerciseName} to superset block!`);
                handleSmoothClose();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-white/10 transition-colors text-left text-white text-sm font-bold"
            >
              <Plus className="w-5 h-5 text-zinc-300" />
              <span>Add To Superset</span>
            </button>

            <div className="h-px bg-white/5 mx-2" />

            {/* Remove Exercise */}
            <button
              onClick={() => {
                if (confirm(`Remove ${exercise.exerciseName} from this workout session?`)) {
                  handleSmoothClose(() => onRemoveExercise(exercise.exerciseId));
                }
              }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-rose-950/30 transition-colors text-left text-rose-400 text-sm font-bold"
            >
              <X className="w-5 h-5 text-rose-400" />
              <span>Remove Exercise</span>
            </button>
          </div>

          <button
            onClick={() => handleSmoothClose()}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-2xl text-xs transition-colors mt-2"
          >
            Cancel
          </button>
        </div>
      )}

      {/* 2. REORDER EXERCISES MODAL */}
      {activeModal === 'reorder' && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`bg-[#08080C] border border-white/15 rounded-3xl w-full max-w-md p-5 space-y-5 shadow-2xl h-[85vh] flex flex-col sheet-panel ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-full sm:translate-y-12 scale-95'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="w-8" />
            <h3 className="text-base font-black text-white text-center">Reorder</h3>
            <button onClick={() => setActiveModal('menu')} className="text-xs text-zinc-400 hover:text-white font-bold">
              Back
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
            {reorderedList.map((ex, idx) => (
              <div
                key={ex.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-3.5 rounded-2xl bg-[#121218] border transition-all cursor-grab active:cursor-grabbing select-none ${
                  draggedIndex === idx
                    ? 'border-blue-500 bg-white/10 opacity-70 scale-[0.99] shadow-lg'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleRemoveFromReorder(ex.exerciseId)}
                    className="text-rose-500 hover:text-rose-400 p-0.5 shrink-0"
                    title="Remove from list"
                  >
                    <MinusCircle className="w-5 h-5 fill-rose-500 text-black" />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                    <Dumbbell className="w-4 h-4 text-black" />
                  </div>

                  <span className="text-sm font-bold text-white truncate max-w-[200px]">
                    {ex.exerciseName}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-zinc-400 hover:text-white cursor-grab active:cursor-grabbing">
                  <Menu className="w-5 h-5 text-zinc-400" />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveReorder}
            className="w-full bg-[#007AFF] hover:bg-blue-600 text-white font-black py-3.5 rounded-2xl text-sm shadow-xl"
          >
            Done
          </button>
        </div>
      )}

      {/* 3. REPLACE EXERCISE MODAL */}
      {activeModal === 'replace' && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`bg-[#08080C] border border-white/15 rounded-3xl w-full max-w-md p-4 sm:p-5 space-y-4 shadow-2xl h-[85vh] flex flex-col sheet-panel ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-full sm:translate-y-12 scale-95'
          }`}
        >
          {/* Modal Navbar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <button onClick={() => setActiveModal('menu')} className="text-xs sm:text-sm font-bold text-[#007AFF]">
              Cancel
            </button>
            <h3 className="text-sm sm:text-base font-black text-white">Replace Exercise</h3>
            <button
              onClick={() => {
                alert('Create custom exercise feature');
              }}
              className="text-xs sm:text-sm font-bold text-[#007AFF]"
            >
              Create
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercise"
              className="w-full bg-[#121218] border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <select
              value={selectedEquipmentFilter}
              onChange={(e) => setSelectedEquipmentFilter(e.target.value)}
              className="bg-[#121218] text-white border border-white/15 rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
            >
              <option value="All">All Equipment</option>
              <option value="Barbell">Barbell</option>
              <option value="Dumbbell">Dumbbell</option>
              <option value="Cable">Cable</option>
              <option value="Machine">Machine</option>
            </select>

            <select
              value={selectedMuscleFilter}
              onChange={(e) => setSelectedMuscleFilter(e.target.value)}
              className="bg-[#121218] text-white border border-white/15 rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
            >
              <option value="All">All Muscles</option>
              <option value="Chest">Chest</option>
              <option value="Shoulders">Shoulders</option>
              <option value="Lats">Lats</option>
              <option value="Upper Back">Upper Back</option>
              <option value="Biceps">Biceps</option>
              <option value="Triceps">Triceps</option>
              <option value="Quads">Quads</option>
              <option value="Hamstrings">Hamstrings</option>
            </select>
          </div>

          {/* Exercise Lists */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none">
            {suggestedList.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Suggested Exercises</div>
                <div className="space-y-1">
                  {suggestedList.map((exDef) => (
                    <div
                      key={exDef.id}
                      onClick={() => {
                        handleSmoothClose(() => onReplaceExercise(exercise.exerciseId, exDef));
                      }}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#121218] border border-white/5 hover:border-blue-500/40 hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                          <Dumbbell className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-white">{exDef.name}</h5>
                          <p className="text-[11px] text-zinc-400">{exDef.muscleGroup}</p>
                        </div>
                      </div>

                      <Info className="w-4 h-4 text-zinc-500 hover:text-white" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {popularList.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">Popular Exercises</div>
                <div className="space-y-1">
                  {popularList.map((exDef) => (
                    <div
                      key={exDef.id}
                      onClick={() => {
                        handleSmoothClose(() => onReplaceExercise(exercise.exerciseId, exDef));
                      }}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#121218] border border-white/5 hover:border-blue-500/40 hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                          <Dumbbell className="w-5 h-5 text-black" />
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-white">{exDef.name}</h5>
                          <p className="text-[11px] text-zinc-400">{exDef.muscleGroup}</p>
                        </div>
                      </div>

                      <Info className="w-4 h-4 text-zinc-500 hover:text-white" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
