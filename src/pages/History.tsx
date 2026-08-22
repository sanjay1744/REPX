import React, { useState } from 'react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import type { WorkoutSession, ExerciseLog, SetLog } from '../types';
import { Calendar, Dumbbell, Trophy, ChevronRight, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

export const HistoryPage: React.FC = () => {
  const { history } = useWorkoutStore();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const completedSessions = history.filter((s) => s.status === 'completed');

  const toggleExpand = (id: string) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    return `${mins} min`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Workout History</h2>
          <p className="text-[11px] sm:text-xs text-zinc-400 font-semibold">Review your previous sessions and set logs</p>
        </div>
        <div className="glass-input border border-white/20 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black text-white shadow-sm">
          {completedSessions.length} Sessions
        </div>
      </div>

      {completedSessions.length === 0 ? (
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-3.5">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl glass-input flex items-center justify-center mx-auto text-white shadow-xl">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">No Completed Workouts Yet</h3>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Start a workout session from the home dashboard to log your sets and build your training calendar.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {completedSessions.map((session: WorkoutSession) => {
            const isExpanded = expandedSessionId === session.id;
            const dateStr = session.completedAt ? format(new Date(session.completedAt), 'PPP') : 'Recent';

            return (
              <div
                key={session.id}
                className="glass-panel rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/20"
              >
                <div
                  onClick={() => toggleExpand(session.id)}
                  className="p-4 sm:p-5 cursor-pointer hover:bg-white/[0.03] flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl glass-input border border-white/15 text-white flex items-center justify-center font-bold">
                      <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-[9px] sm:text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">
                        {dateStr}
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-white">{session.dayName}</h4>
                      <p className="text-[11px] sm:text-xs text-zinc-400 font-semibold">{session.dayFocus}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-black text-white">
                        {(session.totalVolume / 1000).toFixed(1)} Tons
                      </div>
                      <div className="text-[10px] text-zinc-400 font-extrabold uppercase">
                        {formatDuration(session.durationSeconds)} • {session.totalSets} Sets
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/[0.08] bg-[#08080C]/60 p-4 sm:p-5 space-y-3.5">
                    <div className="grid grid-cols-3 gap-2 text-center mb-2.5">
                      <div className="glass-input rounded-xl sm:rounded-2xl p-2 sm:p-2.5">
                        <div className="text-xs font-black text-white">{formatDuration(session.durationSeconds)}</div>
                        <div className="text-[8px] sm:text-[9px] text-zinc-400 uppercase font-extrabold tracking-wider">Duration</div>
                      </div>
                      <div className="glass-input rounded-xl sm:rounded-2xl p-2 sm:p-2.5">
                        <div className="text-xs font-black text-white">{session.totalSets}</div>
                        <div className="text-[8px] sm:text-[9px] text-zinc-400 uppercase font-extrabold tracking-wider">Total Sets</div>
                      </div>
                      <div className="glass-input rounded-xl sm:rounded-2xl p-2 sm:p-2.5">
                        <div className="text-xs font-black text-white">{session.totalVolume} kg</div>
                        <div className="text-[8px] sm:text-[9px] text-zinc-400 uppercase font-extrabold tracking-wider">Volume</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {session.exercises.map((ex: ExerciseLog) => (
                        <div key={ex.id} className="glass-input rounded-xl sm:rounded-2xl p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-black text-white">{ex.exerciseName}</span>
                            <span className="text-[9px] sm:text-[10px] text-zinc-400 font-extrabold">{ex.muscleGroup}</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {ex.sets
                              .filter((s: SetLog) => s.completed)
                              .map((setLog: SetLog) => (
                                <span
                                  key={setLog.id}
                                  className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl font-mono ${
                                    setLog.isPR
                                      ? 'bg-white text-black font-extrabold shadow-sm'
                                      : 'glass-input text-zinc-300'
                                  }`}
                                >
                                  {setLog.isPR && <Trophy className="w-2.5 h-2.5 text-black" />}
                                  {setLog.weight}kg × {setLog.reps}
                                </span>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
