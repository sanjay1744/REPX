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
    <div className="fixed bottom-16 left-3 right-3 sm:left-auto sm:right-6 sm:w-80 z-50">
      <div className="glass-panel border-white/20 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl glass-input border border-white/15 text-white flex items-center justify-center animate-pulse">
              <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-zinc-400 uppercase">REST TIMER</div>
              <div className="text-xs text-white font-bold truncate max-w-[130px] sm:max-w-[140px]">{restTimer.exerciseName}</div>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white">
            {formattedTime}
          </div>
        </div>

        <div className="w-full bg-[#08080C] h-1.5 sm:h-2 rounded-full overflow-hidden mb-2.5 sm:mb-3 border border-white/[0.08]">
          <div
            className="bg-white h-full transition-all duration-1000 ease-linear shadow-[0_0_8px_#FFFFFF]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addTimerSeconds(30)}
            className="flex-1 flex items-center justify-center gap-1 glass-input text-white py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all hover:bg-white hover:text-black"
          >
            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>+30 SEC</span>
          </button>
          <button
            onClick={skipRestTimer}
            className="flex-1 flex items-center justify-center gap-1 bg-white text-black py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all shadow-md hover:bg-zinc-200"
          >
            <FastForward className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black" />
            <span>SKIP REST</span>
          </button>
        </div>
      </div>
    </div>
  );
};
