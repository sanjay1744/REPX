import React, { useState, useEffect } from 'react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useAuthStore } from '../store/useAuthStore';
import { SetRow } from '../components/Workout/SetRow';
import { AddExerciseModal } from '../components/Workout/AddExerciseModal';
import type { WorkoutSession, ExerciseLog, SetLog } from '../types';
import {
  ChevronDown,
  Clock,
  Plus,
  Dumbbell,
  MoreVertical,
  Trophy,
  CheckCircle2
} from 'lucide-react';

interface WorkoutSessionProps {
  onNavigateTab: (tab: 'dashboard' | 'workout' | 'history' | 'analytics' | 'prs') => void;
}

export const WorkoutSessionPage: React.FC<WorkoutSessionProps> = ({ onNavigateTab }) => {
  const { user } = useAuthStore();
  const {
    activeSession,
    updateSet,
    toggleSetCompletion,
    addSetToExercise,
    deleteSetFromExercise,
    addExerciseToActiveSession,
    finishWorkout,
    discardWorkout,
    history
  } = useWorkoutStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      const seconds = Math.round((new Date().getTime() - new Date(activeSession.startedAt).getTime()) / 1000);
      setElapsedSeconds(seconds);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
          <Dumbbell className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">No Active Workout Session</h3>
        <p className="text-sm text-zinc-400 max-w-sm">
          Select a workout routine from your Workout tab to start logging exercises.
        </p>
        <button
          onClick={() => onNavigateTab('workout')}
          className="bg-white text-black font-extrabold px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform"
        >
          Go to Workout Routines
        </button>
      </div>
    );
  }

  const previousSession = history
    .filter((s: WorkoutSession) => s.workoutDayId === activeSession.workoutDayId && s.status === 'completed')
    .sort((a: WorkoutSession, b: WorkoutSession) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime())[0];

  const totalSetsCompleted = activeSession.exercises.reduce(
    (total: number, ex: ExerciseLog) => total + ex.sets.filter((s: SetLog) => s.completed).length,
    0
  );

  const totalVolume = activeSession.exercises.reduce(
    (totalVol: number, ex: ExerciseLog) =>
      totalVol + ex.sets.reduce((sum: number, s: SetLog) => (s.completed ? sum + s.weight * s.reps : sum), 0),
    0
  );

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}min ${secs}s`;
  };

  const handleFinishConfirm = async () => {
    await finishWorkout(user?.uid);
    setShowFinishModal(false);
    onNavigateTab('history');
  };

  return (
    <div className="space-y-5 pb-32 max-w-md mx-auto sm:max-w-xl">
      {/* METRICS HEADER: Inline initially, FIXED AT TOP-0 when scrolled */}
      <div
        className={
          isScrolled
            ? 'fixed top-0 left-0 right-0 z-50 bg-[#08080C]/95 backdrop-blur-md py-2.5 px-3 border-b border-white/15 shadow-2xl transition-all'
            : 'bg-[#08080C] py-3 px-4 rounded-2xl border border-white/10 shadow-xl transition-all'
        }
      >
        <div className="max-w-md mx-auto sm:max-w-xl flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Duration</div>
            <div className="text-xs sm:text-sm font-black text-[#38BDF8]">{formatDuration(elapsedSeconds)}</div>
          </div>
          <div className="space-y-0.5 text-center">
            <div className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Volume</div>
            <div className="text-xs sm:text-sm font-black text-white">{Math.round(totalVolume)} kg</div>
          </div>
          <div className="space-y-0.5 text-center">
            <div className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Sets</div>
            <div className="text-xs sm:text-sm font-black text-white">{totalSetsCompleted}</div>
          </div>
          <div className="flex justify-end pl-1">
            <button
              onClick={() => setShowFinishModal(true)}
              className="bg-[#007AFF] hover:bg-blue-600 text-white text-xs sm:text-sm font-black px-4 py-2 sm:px-5 sm:py-2 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
            >
              Finish
            </button>
          </div>
        </div>
      </div>

      {/* Spacer when metrics header is fixed top-0 */}
      {isScrolled && <div className="h-12 sm:h-14"></div>}

      {/* CONTINUOUS SMOOTH SCROLL EXERCISES LIST */}
      <div className="space-y-6 pt-1">
        {activeSession.exercises.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl glass-input flex items-center justify-center mx-auto text-white">
              <Dumbbell className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-white">No Exercises Added Yet</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Tap the button below to search and add your first exercise.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#007AFF] hover:bg-blue-600 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-lg"
            >
              + Add Exercise
            </button>
          </div>
        ) : (
          activeSession.exercises.map((ex: ExerciseLog) => {
            const prevExLog = previousSession?.exercises.find((e: ExerciseLog) => e.exerciseId === ex.exerciseId);

            return (
              <div
                key={ex.id}
                className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3.5 border border-white/10 shadow-2xl"
              >
                {/* Exercise Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-black shrink-0 shadow-md">
                      <Dumbbell className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#38BDF8] tracking-tight">{ex.exerciseName}</h3>
                    </div>
                  </div>

                  <button className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                {/* Form Notes & Cue */}
                {ex.notes && (
                  <p className="text-xs text-zinc-300 leading-relaxed font-normal">{ex.notes}</p>
                )}

                <div className="text-xs text-zinc-500 font-medium cursor-pointer hover:text-zinc-300">
                  Add notes here...
                </div>

                {/* Rest Timer row */}
                <div className="flex items-center gap-1.5 text-xs text-[#38BDF8] font-bold">
                  <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Rest Timer: 2min 0s</span>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-1.5 sm:gap-2 items-center text-[10px] sm:text-xs font-black text-zinc-400 uppercase tracking-wider px-1 pt-1">
                  <span className="col-span-2">SET</span>
                  <span className="col-span-3 text-center">PREVIOUS</span>
                  <span className="col-span-3 text-center">KG</span>
                  <span className="col-span-2 text-center">REPS</span>
                  <span className="col-span-2 text-right pr-1">✓</span>
                </div>

                {/* Set Log Rows */}
                <div className="space-y-2">
                  {ex.sets.map((setLog: SetLog) => {
                    const prevSet = prevExLog?.sets.find((s) => s.setNumber === setLog.setNumber);

                    return (
                      <SetRow
                        key={setLog.id}
                        setLog={setLog}
                        previousWeight={prevSet?.weight}
                        previousReps={prevSet?.reps}
                        onUpdate={(w, r, rir) => updateSet(ex.exerciseId, setLog.setNumber, w, r, rir)}
                        onToggleComplete={() => toggleSetCompletion(ex.exerciseId, setLog.setNumber)}
                        onDelete={ex.sets.length > 1 ? () => deleteSetFromExercise(ex.exerciseId, setLog.setNumber) : undefined}
                      />
                    );
                  })}
                </div>

                {/* Add Set Button */}
                <button
                  onClick={() => addSetToExercise(ex.exerciseId)}
                  className="w-full bg-[#181824] hover:bg-white/10 text-white font-bold text-xs py-2.5 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add Set</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* BOTTOM ACTIONS SECTION */}
      <div className="space-y-3 pt-4">
        {/* Add Exercise Primary Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full bg-[#007AFF] hover:bg-blue-600 text-white font-black text-sm py-3.5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5 text-white" />
          <span>Add Exercise</span>
        </button>

        {/* Secondary Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => alert('Workout Settings')}
            className="glass-input hover:bg-white/15 text-white font-bold text-xs py-3 rounded-2xl border border-white/10 transition-all text-center"
          >
            Settings
          </button>

          <button
            onClick={discardWorkout}
            className="glass-input hover:bg-rose-950/40 text-rose-400 font-bold text-xs py-3 rounded-2xl border border-white/10 hover:border-rose-900 transition-all text-center"
          >
            Discard Workout
          </button>
        </div>
      </div>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelectExercise={(exDef) => {
          addExerciseToActiveSession({
            exerciseId: exDef.id,
            name: exDef.name,
            muscleGroup: exDef.muscleGroup,
            equipment: exDef.equipment
          });
        }}
      />

      {/* Finish Session Confirmation Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl glass-input flex items-center justify-center font-bold text-white">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">Great Workout Session! 🎉</h3>
                <p className="text-[11px] sm:text-xs text-zinc-400">Review your achievements before saving</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 glass-input rounded-2xl p-3.5 sm:p-4">
              <div>
                <div className="text-[10px] sm:text-xs text-zinc-400 font-bold uppercase tracking-wider">Duration</div>
                <div className="text-base sm:text-lg font-black text-white">{formatDuration(elapsedSeconds)}</div>
              </div>
              <div>
                <div className="text-[10px] sm:text-xs text-zinc-400 font-bold uppercase tracking-wider">Sets Completed</div>
                <div className="text-base sm:text-lg font-black text-white">{totalSetsCompleted} Sets</div>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              Your logged sets and progression data will be saved to your training history.
            </p>

            <div className="flex items-center gap-2.5 sm:gap-3 pt-1">
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 glass-input text-zinc-300 py-2.5 sm:py-3 rounded-xl text-xs font-bold hover:text-white"
              >
                Back to Workout
              </button>
              <button
                onClick={handleFinishConfirm}
                className="flex-1 bg-white hover:bg-zinc-200 text-black py-2.5 sm:py-3 rounded-xl text-xs font-black shadow-lg"
              >
                Save & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
