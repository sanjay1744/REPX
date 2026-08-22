import { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useWorkoutStore } from './store/useWorkoutStore';
import { Navbar } from './components/Navigation/Navbar';
import { RestTimer } from './components/Workout/RestTimer';
import { Dashboard } from './pages/Dashboard';
import { WorkoutSessionPage } from './pages/WorkoutSession';
import { WorkoutTab } from './pages/WorkoutTab';
import { HistoryPage } from './pages/History';
import { AnalyticsPage } from './pages/Analytics';
import { PersonalRecordsPage } from './pages/PersonalRecords';
import { INITIAL_PPL_PROGRAM } from './data/pplProgramData';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workout' | 'history' | 'analytics' | 'prs'>('dashboard');
  const { initializeAuth, user } = useAuthStore();
  const { activeSession, startWorkout, loadUserWorkoutData } = useWorkoutStore();

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  useEffect(() => {
    if (user?.uid) {
      loadUserWorkoutData(user.uid);
    }
  }, [user?.uid, loadUserWorkoutData]);

  const handleStartWorkout = (dayId: string) => {
    const day = INITIAL_PPL_PROGRAM.days.find((d) => d.id === dayId);
    if (day) {
      startWorkout(day);
      setActiveTab('workout');
    }
  };

  return (
    <div className="min-h-screen bg-[#08080C] text-zinc-100 font-sans relative">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSessionActive={!!activeSession}
      />

      <main className="max-w-md mx-auto sm:max-w-xl px-3 sm:px-4 pt-3 sm:pt-4 relative z-10">
        {activeTab === 'dashboard' && (
          <Dashboard
            onStartWorkout={handleStartWorkout}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'workout' && (
          activeSession ? (
            <WorkoutSessionPage onNavigateTab={setActiveTab} />
          ) : (
            <WorkoutTab onStartWorkout={handleStartWorkout} />
          )
        )}

        {activeTab === 'history' && <HistoryPage />}

        {activeTab === 'analytics' && <AnalyticsPage />}

        {activeTab === 'prs' && <PersonalRecordsPage />}
      </main>

      <RestTimer />
    </div>
  );
}

export default App;
