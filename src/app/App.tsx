import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { Loader2 } from 'lucide-react';

// Component Imports
import { ModernHeader } from './components/ModernHeader';
import { ModernSidebar } from './components/ModernSidebar';
import RequireAuth from './components/RequireAuth';
import CommandMenu from './components/CommandMenu';
import OnboardingTour from './components/OnboardingTour';

// Core Authentication & Layout Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import SettingsLayout from './pages/settings/SettingsLayout';

// Feature Pages
import Projects from './pages/Projects';
import MyTasks from './pages/MyTasks';
import Team from './pages/Team';
import Profile from './pages/Profile';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Automations from './pages/Automations';
import Timesheets from './pages/Timesheets';
import Messages from './pages/Messages';
import ProjectDetail from './pages/ProjectDetail';
import CodeStudio from './pages/CodeStudio';
import SprintPlanner from './pages/SprintPlanner';

// Future Expansion Pages (Lazy loaded)
const ApiPlayground = lazy(() => import('./pages/APIplayground').catch(() => ({ default: () => <PlaceholderPage title="API Console & Webhook Tester" description="Interactive API console coming right up..." /> })));

import { Toaster } from 'sonner';

function PageLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center p-12 text-gray-400">
      <Loader2 size={24} className="animate-spin text-indigo-500" />
    </div>
  );
}

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-3 animate-in fade-in duration-200">
      <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
      <p className="text-xs text-gray-400">{description}</p>
      <div className="p-12 text-center bg-[#161b22] border border-gray-800 rounded-3xl mt-4">
        <p className="text-sm font-semibold text-gray-300">Feature Ready to Implement</p>
        <p className="text-xs text-gray-500 mt-1">Say "next" whenever you want to code this screen.</p>
      </div>
    </div>
  );
}

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <CommandMenu />
      {/* First-time Guided Onboarding Tour */}
      <OnboardingTour />
      
      <ModernHeader onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <ModernSidebar 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster richColors position="top-right" />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Workspace Routes */}
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                {/* Redirect root to Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Work & Sprint Engineering */}
                <Route path="/tasks" element={<MyTasks />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/sprint-planner" element={<SprintPlanner />} />
                <Route path="/code" element={<CodeStudio />} />
                <Route path="/api-playground" element={<ApiPlayground />} />
                <Route path="/timesheets" element={<Timesheets />} />
                <Route path="/automations" element={<Automations />} />
                
                {/* Team & Collaboration */}
                <Route path="/messages" element={<Navigate to="/messages/room_1" replace />} />
                <Route path="/messages/:roomId" element={<Messages />} />
                <Route path="/team" element={<Team />} />
                <Route path="/calendar" element={<Calendar />} />

                {/* Account & Analytics */}
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/analytics" element={<Analytics />} />

                {/* Settings */}
                <Route path="/settings" element={<SettingsLayout />} />
              </Route>
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}