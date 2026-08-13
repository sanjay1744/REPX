import React, { useEffect } from 'react';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { Timer, Plus, FastForward } from 'lucide-react';

export const RestTimer: React.FC = () => {
  const { restTimer, tickRestTimer, addTimerSeconds, skipRestTimer } = useWorkoutStore();

  useEffect(() => {
    let interval: any = null;
    if (restTimer.isRunning && restTimer.secondsRemaining > 0) {
      interval = setInterval(() => {
        tickRestTimer();
      }, 1000);
    } else if (restTimer.secondsRemaining === 0 && restTimer.isRunning) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {
        // Audio muted
      }
    }
    return () => clearInterval(interval);
  }, [restTimer.isRunning, restTimer.secondsRemaining, tickRestTimer]);

  if (!restTimer.isRunning && restTimer.secondsRemaining === 0) return null;

  const minutes = Math.floor(restTimer.secondsRemaining / 60);
  const seconds = restTimer.secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = restTimer.totalSeconds > 0 ? (restTimer.secondsRemaining / restTimer.totalSeconds) * 100 : 0;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50">
      <div className="bg-gym-card/95 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-3.5 shadow-2xl shadow-emerald-950/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">Rest Timer</div>
              <div className="text-xs text-slate-300 font-medium truncate max-w-[140px]">{restTimer.exerciseName}</div>
            </div>
          </div>
          <div className="text-2xl font-black font-mono tracking-wider text-white">
            {formattedTime}
          </div>
        </div>

        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addTimerSeconds(30)}
            className="flex-1 flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+30 SEC</span>
          </button>
          <button
            onClick={skipRestTimer}
            className="flex-1 flex items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-1.5 rounded-xl text-xs font-semibold border border-emerald-500/30 transition-colors"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>SKIP REST</span>
          </button>
        </div>
      </div>
    </div>
  );
};
