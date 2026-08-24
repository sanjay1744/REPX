import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Dumbbell, LayoutDashboard, History, BarChart3, Trophy, LogIn, LogOut } from 'lucide-react';
import { AuthModal } from '../Auth/AuthModal';

interface NavbarProps {
  activeTab: 'dashboard' | 'workout' | 'history' | 'analytics' | 'prs';
  setActiveTab: (tab: 'dashboard' | 'workout' | 'history' | 'analytics' | 'prs') => void;
  isSessionActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isSessionActive }) => {
  const { user, isGuest, signOut } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isWorkoutSessionActive = isSessionActive && activeTab === 'workout';

  return (
    <>
      {/* Top Navbar Header */}
      <header className={`${isWorkoutSessionActive ? 'relative' : 'sticky top-0'} z-30 glass-nav px-3 py-2.5 sm:px-4 sm:py-3 border-b border-white/10 bg-[#08080C]/90 backdrop-blur-md transition-all`}>
        <div className="max-w-md mx-auto sm:max-w-xl flex items-center justify-between">
          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative w-8 h-8 rounded-xl bg-white p-0.5 shadow-md">
              <div className="w-full h-full bg-[#08080C] rounded-[10px] flex items-center justify-center">
                <Dumbbell className="w-3.5 h-3.5 text-white font-black" />
              </div>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-wider text-white">
                REPX
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {isSessionActive && activeTab !== 'workout' && (
              <button
                onClick={() => setActiveTab('workout')}
                className="flex items-center gap-1 bg-white/10 text-white border border-white/20 px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-black animate-pulse"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#FFFFFF]"></span>
                <span>Active</span>
              </button>
            )}

            {isGuest ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1 glass-input text-white px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold hover:bg-white hover:text-black transition-all"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 glass-input px-2.5 py-1.5 rounded-xl text-xs">
                <span className="text-white font-bold max-w-[70px] sm:max-w-[90px] truncate">{user?.name.split(' ')[0]}</span>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />


      {/* Mobile Compact Floating Bottom Dock Navigation Bar */}
      <nav className="fixed bottom-2.5 left-3 right-3 z-40 max-w-md mx-auto sm:max-w-lg">
        <div className="glass-dock rounded-2xl sm:rounded-3xl p-1 flex items-center justify-around shadow-2xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-extrabold transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'text-black bg-white shadow-md scale-105'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('workout')}
            className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-extrabold transition-all duration-200 ${
              activeTab === 'workout'
                ? 'text-black bg-white shadow-md scale-105'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {isSessionActive && (
              <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            )}
            <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Workout</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-extrabold transition-all duration-200 ${
              activeTab === 'history'
                ? 'text-black bg-white shadow-md scale-105'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>History</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-extrabold transition-all duration-200 ${
              activeTab === 'analytics'
                ? 'text-black bg-white shadow-md scale-105'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('prs')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-extrabold transition-all duration-200 ${
              activeTab === 'prs'
                ? 'text-black bg-white shadow-md scale-105'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>PRs</span>
          </button>
        </div>
      </nav>
    </>
  );
};

