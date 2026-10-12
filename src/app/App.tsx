import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { OnboardingSandboxProvider } from '../context/OnboardingSandboxContext';
import { Loader2, ShieldAlert, ArrowRight } from 'lucide-react';
import { Toaster } from 'sonner';
import { supabase } from '../lib/supabaseClient';

// Core component imports
import { ModernHeader } from './components/ModernHeader';
import { ModernSidebar } from './components/ModernSidebar';
import RequireAuth from './components/RequireAuth';
import CommandMenu from './components/CommandMenu';
import OnboardingTour from './components/OnboardingTour';
import { ErrorBoundary } from '../components/ErrorBoundary';
import DesktopOnlyGuard from './components/DesktopOnlyGuard';
import SplashScreen from './components/SplashScreen';
import NetworkStatusPill from './components/NetworkStatusPill';

// Core authentication and layout pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import TwoFactorVerify from './pages/TwoFactorVerify';
import SettingsLayout from './pages/settings/SettingsLayout';

// Feature pages
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

// Mobile-specific pages
import MobileTriageDeck from './pages/MobileTriageDeck';
import DailyStandupStories from './pages/DailyStandupStories';
import QuickCaptureSheet from './pages/QuickCaptureSheet';

const ApiPlayground = lazy(() =>
  import('./pages/ApiPlayground').catch(() => ({
    default: () => (
      <div className="p-8 max-w-4xl mx-auto space-y-3 animate-in fade-in duration-200">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          API Console & Webhook Tester
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Interactive API playground module.
        </p>
      </div>
    ),
  }))
);

const SUPER_ADMIN_EMAIL =
  import.meta.env.VITE_SUPER_ADMIN_EMAIL?.toLowerCase().trim() || '';

function PageLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center p-12 text-gray-400">
      <Loader2 size={24} className="animate-spin text-indigo-500" />
    </div>
  );
}

// Redirects desktop devices to the dashboard to prevent stretched mobile UI layouts
function MobileOnlyGuard({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  );

  useEffect(() => {
    const checkViewport = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  if (isDesktop) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, session } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin =
    user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();

  const isVerified = Boolean(
    user?.is_verified ||
      user?.email_verified ||
      session?.user?.email_confirmed_at ||
      isSuperAdmin
  );

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
      <OnboardingTour />
      <NetworkStatusPill />

      {!isVerified && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-medium z-30">
          <div className="flex items-center gap-2 truncate">
            <ShieldAlert size={15} className="shrink-0" />
            <span className="truncate">
              Your account is unverified. Advanced features are locked.
            </span>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-1 font-bold underline hover:text-amber-500 dark:hover:text-amber-300 transition-colors ml-4 shrink-0"
          >
            <span>Verify Email</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      <ModernHeader
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <ModernSidebar
          isOpen={isSidebarOpen || isMobileMenuOpen}
          onClose={() => {
            setIsMobileMenuOpen(false);
            setIsSidebarOpen(false);
          }}
        />

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
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('pf_splash_shown');
  });

  const handleFinishSplash = () => {
    sessionStorage.setItem('pf_splash_shown', 'true');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && (
        <SplashScreen onFinish={handleFinishSplash} minDurationMs={3600} />
      )}

      <AuthProvider>
        <ThemeProvider>
          <OnboardingSandboxProvider>
            <Toaster richColors position="top-right" />
            <BrowserRouter>
              <ErrorBoundary>
                <Routes>
                  {/* Public authentication routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/2fa" element={<TwoFactorVerify />} />

                  {/* Protected workspace routes */}
                  <Route element={<RequireAuth />}>
                    <Route element={<Layout />}>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />

                      {/* Work routes */}
                      <Route path="/tasks" element={<MyTasks />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/projects/:id" element={<ProjectDetail />} />
                      <Route
                        path="/sprint-planner"
                        element={
                          <DesktopOnlyGuard featureName="Sprint Planner">
                            <SprintPlanner />
                          </DesktopOnlyGuard>
                        }
                      />
                      <Route
                        path="/code"
                        element={
                          <DesktopOnlyGuard featureName="Code Studio">
                            <CodeStudio />
                          </DesktopOnlyGuard>
                        }
                      />
                      <Route
                        path="/api-playground"
                        element={
                          <DesktopOnlyGuard featureName="API Console">
                            <ApiPlayground />
                          </DesktopOnlyGuard>
                        }
                      />
                      <Route
                        path="/docs"
                        element={
                          <DesktopOnlyGuard featureName="API Documentation">
                            <ApiDocs />
                          </DesktopOnlyGuard>
                        }
                      />
                      <Route
                        path="/timesheets"
                        element={
                          <DesktopOnlyGuard featureName="Timesheets">
                            <Timesheets />
                          </DesktopOnlyGuard>
                        }
                      />
                      <Route
                        path="/automations"
                        element={
                          <DesktopOnlyGuard featureName="Automations">
                            <Automations />
                          </DesktopOnlyGuard>
                        }
                      />

                      {/* Team and collaboration */}
                      <Route
                        path="/messages"
                        element={<Navigate to="/messages/room_1" replace />}
                      />
                      <Route path="/messages/:roomId" element={<Messages />} />
                      <Route path="/team" element={<Team />} />
                      <Route
                        path="/retrospectives"
                        element={
                          <DesktopOnlyGuard featureName="Retrospectives">
                            <Retrospectives />
                          </DesktopOnlyGuard>
                        }
                      />
                      <Route
                        path="/retrospectives/velocity"
                        element={<TeamVelocity />}
                      />
                      <Route
                        path="/calendar"
                        element={
                          <DesktopOnlyGuard featureName="Monthly Calendar">
                            <Calendar />
                          </DesktopOnlyGuard>
                        }
                      />

                      {/* Account and analytics */}
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/:id" element={<Profile />} />
                      <Route
                        path="/analytics"
                        element={
                          <DesktopOnlyGuard featureName="Telemetry Analytics">
                            <Analytics />
                          </DesktopOnlyGuard>
                        }
                      />

                      {/* Dedicated mobile experiences guarded against desktop screen widths */}
                      <Route
                        path="/triage"
                        element={
                          <MobileOnlyGuard>
                            <MobileTriageDeck />
                          </MobileOnlyGuard>
                        }
                      />
                      <Route
                        path="/standup"
                        element={
                          <MobileOnlyGuard>
                            <DailyStandupStories />
                          </MobileOnlyGuard>
                        }
                      />
                      <Route
                        path="/capture"
                        element={
                          <MobileOnlyGuard>
                            <QuickCaptureSheet />
                          </MobileOnlyGuard>
                        }
                      />

                      {/* Settings */}
                      <Route path="/settings" element={<SettingsLayout />} />
                    </Route>
                  </Route>

                  {/* Fallback catch-all */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </OnboardingSandboxProvider>
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}