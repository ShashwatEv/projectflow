import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { OnboardingSandboxProvider } from '../context/OnboardingSandboxContext';
import { Loader2, ShieldAlert, ArrowRight } from 'lucide-react';
import { Toaster } from 'sonner';
import { supabase } from '../lib/supabaseClient';

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
import TwoFactorVerify from './pages/TwoFactorVerify';
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
import ApiDocs from './pages/ApiDocs';
import Retrospectives from './pages/Retrospectives';
import TeamVelocity from './pages/TeamVelocity';

// Exact Casing for Render / Linux Rollup compatibility
const ApiPlayground = lazy(() => import('./pages/ApiPlayground').catch(() => ({ 
  default: () => (
    <div className="p-8 max-w-4xl mx-auto space-y-3 animate-in fade-in duration-200">
      <h1 className="text-2xl font-bold text-white tracking-tight">API Console & Webhook Tester</h1>
      <p className="text-xs text-gray-400">Interactive API playground module.</p>
    </div>
  ) 
})));

const SUPER_ADMIN_EMAIL = 'shashwatop69@gmail.com';

function PageLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center p-12 text-gray-400">
      <Loader2 size={24} className="animate-spin text-indigo-500" />
    </div>
  );
}

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();
  
  // Resilient verification check: checks custom table flag, auth session confirmed timestamp, or super admin
  const isVerified = Boolean(
    user?.is_verified ||
    user?.email_verified ||
    session?.user?.email_confirmed_at ||
    isSuperAdmin
  );

  // Auto-heal: If auth confirmed the email but public.users flag lags behind, synchronize it
  useEffect(() => {
    if (session?.user?.email_confirmed_at && user?.id && !user?.is_verified) {
      supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', user.id)
        .then(() => {
          window.dispatchEvent(new CustomEvent('user-profile-updated'));
        });
    }
  }, [session?.user?.email_confirmed_at, user?.id, user?.is_verified]);

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <CommandMenu />
      {/* First-time Guided Onboarding Tour */}
      <OnboardingTour />
      
      {/* Ambient Identity Verification Warning Banner */}
      {!isVerified && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-500 dark:text-amber-400 font-medium z-30">
          <div className="flex items-center gap-2 truncate">
            <ShieldAlert size={15} className="shrink-0" />
            <span className="truncate">
              Your account is unverified. Advanced features (unlimited projects, webhooks, and sprint publications) are locked.
            </span>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-1 font-bold underline hover:text-amber-300 transition-colors ml-4 shrink-0"
          >
            <span>Verify Email</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Modern Header with Centered Brand and Clickable Workspace Toggle */}
      <ModernHeader 
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Dynamic Expandable/Collapsible Sidebar */}
        <ModernSidebar 
          isOpen={isSidebarOpen || isMobileMenuOpen} 
          onClose={() => {
            setIsMobileMenuOpen(false);
            setIsSidebarOpen(false);
          }} 
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full transition-all duration-300 ease-in-out">
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
        <OnboardingSandboxProvider>
          <Toaster richColors position="top-right" />
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/2fa" element={<TwoFactorVerify />} />

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
                  <Route path="/docs" element={<ApiDocs />} />
                  <Route path="/timesheets" element={<Timesheets />} />
                  <Route path="/automations" element={<Automations />} />
                  
                  {/* Team & Collaboration */}
                  <Route path="/messages" element={<Navigate to="/messages/room_1" replace />} />
                  <Route path="/messages/:roomId" element={<Messages />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/retrospectives" element={<Retrospectives />} />
                  <Route path="/retrospectives/velocity" element={<TeamVelocity />} />
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
        </OnboardingSandboxProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}