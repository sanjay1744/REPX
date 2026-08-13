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
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Workout History</h2>
          <p className="text-xs text-slate-400">Review your previous sessions and set logs</p>
        </div>
        <div className="bg-gym-card border border-gym-border px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400">
          {completedSessions.length} Sessions Logged
        </div>
      </div>

      {completedSessions.length === 0 ? (
        <div className="bg-gym-card border border-gym-border rounded-3xl p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Completed Workouts Yet</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Start a workout session from the home dashboard to log your sets and build your training calendar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {completedSessions.map((session: WorkoutSession) => {
            const isExpanded = expandedSessionId === session.id;
            const dateStr = session.completedAt ? format(new Date(session.completedAt), 'PPP') : 'Recent';

            return (
              <div
                key={session.id}
                className="bg-gym-card border border-gym-border rounded-3xl overflow-hidden shadow-lg transition-all"
              >
                <div
                  onClick={() => toggleExpand(session.id)}
                  className="p-4 cursor-pointer hover:bg-slate-800/50 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        {dateStr}
                      </div>
                      <h4 className="text-base font-black text-white">{session.dayName}</h4>
                      <p className="text-xs text-slate-400">{session.dayFocus}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-bold text-white">
                        {(session.totalVolume / 1000).toFixed(1)} Tons
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        {formatDuration(session.durationSeconds)} • {session.totalSets} Sets
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-800/80 bg-slate-950/60 p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-slate-900 rounded-xl p-2 border border-slate-800">
                        <div className="text-xs font-extrabold text-white">{formatDuration(session.durationSeconds)}</div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">Duration</div>
                      </div>
                      <div className="bg-slate-900 rounded-xl p-2 border border-slate-800">
                        <div className="text-xs font-extrabold text-white">{session.totalSets}</div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">Total Sets</div>
                      </div>
                      <div className="bg-slate-900 rounded-xl p-2 border border-slate-800">
                        <div className="text-xs font-extrabold text-emerald-400">{session.totalVolume} kg</div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">Volume</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {session.exercises.map((ex: ExerciseLog) => (
                        <div key={ex.id} className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-white">{ex.exerciseName}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{ex.muscleGroup}</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {ex.sets
                              .filter((s: SetLog) => s.completed)
                              .map((setLog: SetLog) => (
                                <span
                                  key={setLog.id}
                                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border font-mono ${
                                    setLog.isPR
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                                      : 'bg-slate-950 text-slate-300 border-slate-800'
                                  }`}
                                >
                                  {setLog.isPR && <Trophy className="w-2.5 h-2.5 text-amber-400" />}
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
