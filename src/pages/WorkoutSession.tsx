import React, { useState, useEffect } from 'react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useAuthStore } from '../store/useAuthStore';
import { BeatLastTimeCard } from '../components/Workout/BeatLastTimeCard';
import { SetRow } from '../components/Workout/SetRow';
import type { WorkoutSession, ExerciseLog, SetLog } from '../types';
import { CheckCircle2, Plus, Clock, Dumbbell, ArrowLeft, Trophy } from 'lucide-react';

interface WorkoutSessionProps {
  onNavigateTab: (tab: 'dashboard' | 'workout' | 'history' | 'analytics' | 'prs') => void;
}

export const WorkoutSessionPage: React.FC<WorkoutSessionProps> = ({ onNavigateTab }) => {
  const { user } = useAuthStore();
  const {
    activeSession,
    activeExerciseIndex,
    setActiveExerciseIndex,
    updateSet,
    toggleSetCompletion,
    addSetToExercise,
    deleteSetFromExercise,
    finishWorkout,
    discardWorkout,
    history
  } = useWorkoutStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      const seconds = Math.round((new Date().getTime() - new Date(activeSession.startedAt).getTime()) / 1000);
      setElapsedSeconds(seconds);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-gym-card border border-gym-border flex items-center justify-center text-slate-500">
          <Dumbbell className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">No Active Workout Session</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          Select a workout day from your dashboard to start logging your exercises and beating last time.
        </p>
        <button
          onClick={() => onNavigateTab('dashboard')}
          className="bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const currentExercise = activeSession.exercises[activeExerciseIndex] || activeSession.exercises[0];

  const previousSession = history
    .filter((s: WorkoutSession) => s.workoutDayId === activeSession.workoutDayId && s.status === 'completed')
    .sort((a: WorkoutSession, b: WorkoutSession) => new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime())[0];

  const previousExerciseLogs = previousSession?.exercises.find((e: ExerciseLog) => e.exerciseId === currentExercise.exerciseId)?.sets;

  const totalSetsCompleted = activeSession.exercises.reduce(
    (total: number, ex: ExerciseLog) => total + ex.sets.filter((s: SetLog) => s.completed).length,
    0
  );
  const totalSetsTarget = activeSession.exercises.reduce((total: number, ex: ExerciseLog) => total + ex.sets.length, 0);

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  };

  const handleFinishConfirm = async () => {
    await finishWorkout(user?.uid);
    setShowFinishModal(false);
    onNavigateTab('history');
  };

  return (
    <div className="space-y-5 pb-28">
      {/* Session Top Info Header */}
      <div className="bg-gym-card border border-gym-border rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDuration(elapsedSeconds)}</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">{activeSession.dayName}</h2>
            <p className="text-xs text-slate-400">{activeSession.dayFocus}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-black text-emerald-400">
              {totalSetsCompleted} / {totalSetsTarget} Sets
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Completed</div>
          </div>
        </div>

        {/* Workout Progress Bar */}
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-3 border border-slate-800">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
            style={{ width: `${(totalSetsCompleted / Math.max(1, totalSetsTarget)) * 100}%` }}
          />
        </div>
      </div>

      {/* Exercise Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {activeSession.exercises.map((ex: ExerciseLog, idx: number) => {
          const isCompleted = ex.sets.length > 0 && ex.sets.every((s: SetLog) => s.completed);
          const isCurrent = idx === activeExerciseIndex;
          const completedCount = ex.sets.filter((s: SetLog) => s.completed).length;

          return (
            <button
              key={ex.id}
              onClick={() => setActiveExerciseIndex(idx)}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border ${
                isCurrent
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                  : isCompleted
                  ? 'bg-slate-900/80 text-emerald-400 border-emerald-900/60'
                  : 'bg-gym-card text-slate-400 border-gym-border hover:border-slate-700'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-950/60 flex items-center justify-center text-[10px] font-black">
                {idx + 1}
              </span>
              <span className="truncate max-w-[110px]">{ex.exerciseName}</span>
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="text-[10px] text-slate-400">({completedCount}/{ex.sets.length})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Exercise Detail Card */}
      <div className="bg-gym-card border border-gym-border rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Exercise {activeExerciseIndex + 1} of {activeSession.exercises.length}
            </span>
            <h3 className="text-xl font-black text-white">{currentExercise.exerciseName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: <span className="text-slate-200 font-semibold">{currentExercise.targetSets} sets × {currentExercise.minReps}-{currentExercise.maxReps} reps</span>
            </p>
          </div>

          <span className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-xl text-xs font-semibold">
            {currentExercise.muscleGroup}
          </span>
        </div>

        {currentExercise.notes && (
          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 text-xs text-slate-300">
            📌 <span className="font-medium text-slate-400">Notes:</span> {currentExercise.notes}
          </div>
        )}

        {/* Beat Last Time Target Card */}
        <BeatLastTimeCard
          exerciseName={currentExercise.exerciseName}
          minReps={currentExercise.minReps}
          maxReps={currentExercise.maxReps}
          previousSets={previousExerciseLogs}
        />

        {/* Set Logs Table */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Set Log</span>
            <span>Weight & Reps</span>
            <span>Complete</span>
          </div>

          {currentExercise.sets.map((setLog: SetLog) => (
            <SetRow
              key={setLog.id}
              setLog={setLog}
              onUpdate={(w, r, rir) => updateSet(currentExercise.exerciseId, setLog.setNumber, w, r, rir)}
              onToggleComplete={() => toggleSetCompletion(currentExercise.exerciseId, setLog.setNumber)}
              onDelete={
                currentExercise.sets.length > 1
                  ? () => deleteSetFromExercise(currentExercise.exerciseId, setLog.setNumber)
                  : undefined
              }
            />
          ))}

          {/* Add Set Button */}
          <button
            onClick={() => addSetToExercise(currentExercise.exerciseId)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 text-xs font-semibold transition-colors bg-slate-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Add Extra Working Set</span>
          </button>
        </div>
      </div>

      {/* Session Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowFinishModal(true)}
          className="flex-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-slate-950 font-black text-sm py-4 rounded-2xl shadow-xl shadow-emerald-950/50 hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>FINISH WORKOUT SESSION</span>
        </button>

        <button
          onClick={discardWorkout}
          className="bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900 px-4 py-4 rounded-2xl text-xs font-bold transition-colors"
          title="Discard Session"
        >
          Discard
        </button>
      </div>

      {/* Finish Session Confirmation Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gym-card border border-gym-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Great Workout Session! 🎉</h3>
                <p className="text-xs text-slate-400">Review your achievements before saving</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase">Duration</div>
                <div className="text-lg font-black text-white">{formatDuration(elapsedSeconds)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase">Sets Completed</div>
                <div className="text-lg font-black text-emerald-400">{totalSetsCompleted} Sets</div>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Your logged sets and progression data will be saved to your training history.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl text-xs font-bold hover:bg-slate-700"
              >
                Back to Workout
              </button>
              <button
                onClick={handleFinishConfirm}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 py-3 rounded-xl text-xs font-black hover:opacity-90 shadow-lg shadow-emerald-950"
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
