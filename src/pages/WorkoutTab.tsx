import React, { useState } from 'react';
import { Plus, ClipboardList, Search, ArrowRight, Dumbbell, ChevronDown, Play } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useAuthStore } from '../store/useAuthStore';
import { CreateRoutineModal } from '../components/Workout/CreateRoutineModal';
import { WorkoutDay, ExerciseTarget } from '../types';

interface WorkoutTabProps {
  onStartWorkout: (dayId: string) => void;
  onStartCustomRoutine?: (day: WorkoutDay) => void;
}

export const WorkoutTab: React.FC<WorkoutTabProps> = ({ onStartWorkout }) => {
  const { user } = useAuthStore();
  const { program, history, activeSession, startWorkout, saveNewRoutine } = useWorkoutStore();
  const [isCreateRoutineOpen, setIsCreateRoutineOpen] = useState(false);
  const [isAllDaysOpen, setIsAllDaysOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  // Calculate today's workout day based on completed sessions rotation
  const completedSessions = history.filter((s) => s.status === 'completed');
  const todayIndex = completedSessions.length % (program.days.length || 6);
  const todayDay = program.days[todayIndex] || program.days[0];

  // Featured day to show in top section (defaults to todayDay)
  const featuredDay = program.days.find((d) => d.id === selectedDayId) || todayDay;

  const handleStartEmptyWorkout = () => {
    const emptyDay: WorkoutDay = {
      id: `empty-workout-${Date.now()}`,
      name: 'Empty Workout',
      focus: 'Custom Workout',
      dayOrder: 1,
      exercises: []
    };
    startWorkout(emptyDay);
  };

  const handleSaveCustomRoutine = async (name: string, exercises: ExerciseTarget[]) => {
    await saveNewRoutine(name, exercises, user?.uid);
  };


  return (
    <div className="space-y-5 pb-28">
      {/* Header Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 cursor-pointer">
          <h2 className="text-2xl font-black tracking-tight text-white">Workout</h2>
          <ChevronDown className="w-5 h-5 text-zinc-400" />
        </div>
        <div className="bg-[#FEF08A] text-black text-[10px] font-black px-2.5 py-0.5 rounded-md tracking-wider">
          PRO
        </div>
      </div>

      {/* Start Empty Workout Card */}
      <button
        onClick={handleStartEmptyWorkout}
        className="w-full glass-panel hover:bg-white/[0.08] text-white rounded-2xl p-4 flex items-center gap-3 transition-all border border-white/10 group shadow-lg text-left"
      >
        <div className="w-8 h-8 rounded-xl glass-input flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
          <Plus className="w-5 h-5" />
        </div>
        <span className="text-sm sm:text-base font-bold tracking-wide">Start Empty Workout</span>
      </button>

      {/* Routines Section Header & Action Grid */}
      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-black text-white">Routines</h3>

        <div className="grid grid-cols-2 gap-3">
          {/* New Routine Button */}
          <button
            onClick={() => setIsCreateRoutineOpen(true)}
            className="glass-panel hover:bg-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 border border-white/10 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl glass-input flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-white">New Routine</span>
          </button>

          {/* Explore Routines Button */}
          <button
            onClick={() => alert('Explore pre-built routines from top strength coaches!')}
            className="glass-panel hover:bg-white/[0.08] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 border border-white/10 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl glass-input flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-white">Explore Routines</span>
          </button>
        </div>
      </div>

      {/* Routine Cards List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">My Routines & Program Days</h4>
          <span className="text-xs text-zinc-500 font-medium">
            {program.days.length} Days / Routines
          </span>
        </div>


        {/* SINGLE CONTAINER: PPL Split */}
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-white/15 shadow-2xl space-y-3">
          {/* PPL Split Header with Day Selector Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-black text-white tracking-tight">PPL Split</h4>
                  <span className="bg-white/10 text-zinc-300 text-[10px] font-black px-2 py-0.5 rounded-lg border border-white/15">
                    6 Days Split
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">Push / Pull / Legs Program</p>
              </div>
            </div>

            {/* Dropdown controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Day Selection Select Dropdown */}
              <select
                value={featuredDay.id}
                onChange={(e) => setSelectedDayId(e.target.value)}
                className="glass-input text-xs font-bold text-white bg-[#121218] border border-white/15 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer hover:border-white/30 transition-all"
              >
                {program.days.map((day) => (
                  <option key={day.id} value={day.id} className="bg-[#121218] text-white">
                    Day {day.dayOrder}: {day.name} {day.id === todayDay.id ? '(Today)' : ''}
                  </option>
                ))}
              </select>

              {/* Expand / Collapse All Days Button */}
              <button
                onClick={() => setIsAllDaysOpen(!isAllDaysOpen)}
                className="glass-input hover:bg-white/15 text-zinc-200 px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 border border-white/15 transition-all"
                title="Toggle all days menu"
              >
                <span>{isAllDaysOpen ? 'Hide' : 'All Days'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 ${isAllDaysOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Top Featured Section: Today's Workout Plan (Push A by default) */}
          <div className="bg-white/[0.04] border border-white/10 rounded-xl sm:rounded-2xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">{featuredDay.name}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-white text-black text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider whitespace-nowrap">
                    {featuredDay.id === todayDay.id ? "TODAY'S WORKOUT" : `DAY ${featuredDay.dayOrder}`}
                  </span>
                  <span className="text-xs text-zinc-400 font-bold whitespace-nowrap">
                    Day {featuredDay.dayOrder} • {featuredDay.focus}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onStartWorkout(featuredDay.id)}
                className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg hover:scale-105 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Start</span>
              </button>
            </div>
          </div>

          {/* Dropdown Menu to View All Days Workouts (Hidden by default) */}
          {isAllDaysOpen && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-extrabold uppercase tracking-wider px-1">
                <span>All Days Workouts ({program.days.length})</span>
                <span className="text-[10px] font-normal text-zinc-500">Tap to select or start</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {program.days.map((day) => {
                  const isSelected = day.id === featuredDay.id;
                  const isToday = day.id === todayDay.id;
                  return (
                    <div
                      key={day.id}
                      onClick={() => setSelectedDayId(day.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-white/10 border-white/30 shadow-md'
                          : 'bg-black/20 border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-zinc-400 glass-input px-1.5 py-0.5 rounded">
                            Day {day.dayOrder}
                          </span>
                          {isToday && (
                            <span className="text-[9px] font-black text-black bg-white px-1.5 py-0.5 rounded uppercase">
                              Today
                            </span>
                          )}
                          <span className="text-xs text-zinc-400 font-semibold">{day.focus}</span>
                        </div>
                        <h5 className="text-sm font-extrabold text-white">{day.name}</h5>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartWorkout(day.id);
                        }}
                        className="bg-white/90 hover:bg-white text-black text-xs font-black px-3 py-1 rounded-lg flex items-center gap-1 shadow transition-all hover:scale-105 ml-2 shrink-0"
                      >
                        <Play className="w-3 h-3 fill-black" />
                        <span>Start</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Routine Modal */}
      <CreateRoutineModal
        isOpen={isCreateRoutineOpen}
        onClose={() => setIsCreateRoutineOpen(false)}
        onSaveRoutine={handleSaveCustomRoutine}
      />
    </div>
  );
};
