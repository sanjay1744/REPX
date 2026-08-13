import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Dumbbell, LayoutDashboard, History, BarChart3, Trophy, LogIn, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'workout' | 'history' | 'analytics' | 'prs';
  setActiveTab: (tab: 'dashboard' | 'workout' | 'history' | 'analytics' | 'prs') => void;
  isSessionActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isSessionActive }) => {
  const { user, isGuest, signInWithGoogle, signOut } = useAuthStore();

  return (
    <>
      {/* Mobile-Optimized Top App Bar */}
      <header className="sticky top-0 z-40 bg-gym-bg/95 backdrop-blur-xl border-b border-gym-border/80 px-4 py-2.5">
        <div className="max-w-md mx-auto sm:max-w-xl flex items-center justify-between">
          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-950/40">
              <Dumbbell className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                GYM OVERLOAD
              </h1>
              <p className="text-[9px] text-emerald-400 font-bold tracking-wider uppercase -mt-0.5">
                6-Day PPL System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSessionActive && activeTab !== 'workout' && (
              <button
                onClick={() => setActiveTab('workout')}
                className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-xl text-xs font-bold animate-pulse"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Active</span>
              </button>
            )}

            {isGuest ? (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1 bg-gym-card hover:bg-slate-800 text-slate-200 border border-gym-border px-2.5 py-1 rounded-xl text-xs font-semibold"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sync</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-gym-card border border-gym-border px-2.5 py-1 rounded-xl text-xs">
                <span className="text-slate-300 font-bold max-w-[80px] truncate">{user?.name.split(' ')[0]}</span>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="text-slate-400 hover:text-rose-400 transition-colors ml-0.5"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Pakka Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gym-bg/95 backdrop-blur-xl border-t border-gym-border/80 px-1 py-1.5">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl min-w-[60px] text-[10px] font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('workout')}
            className={`relative flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl min-w-[60px] text-[10px] font-bold transition-all ${
              activeTab === 'workout'
                ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isSessionActive && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
            <Dumbbell className="w-5 h-5" />
            <span>Workout</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl min-w-[60px] text-[10px] font-bold transition-all ${
              activeTab === 'history'
                ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-5 h-5" />
            <span>History</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl min-w-[60px] text-[10px] font-bold transition-all ${
              activeTab === 'analytics'
                ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('prs')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl min-w-[60px] text-[10px] font-bold transition-all ${
              activeTab === 'prs'
                ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span>PRs</span>
          </button>
        </div>
      </nav>
    </>
  );
};
