import { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext'; // <--- Verify path
import { ThemeProvider } from '../context/ThemeContext'; // <--- Verify path

// Component Imports
import { ModernHeader } from '../app/components/ModernHeader'; // <--- Verify path
import { ModernSidebar } from '../app/components/ModernSidebar'; // <--- Verify path
import RequireAuth from '../app/components/RequireAuth'; 

// Page Imports (Adjust paths if they are in src/app/pages)
import Dashboard from '../app/pages/Dashboard';
import Login from '../app/pages/Login';
import Signup from '../app/pages/Signup';
// import ForgotPassword from './app/pages/ForgotPassword'; // Uncomment if created
import SettingsLayout from '../app/pages/settings/SettingsLayout';

// Feature Pages
import Projects from '../app/pages/Projects';
import MyTasks from '../app/pages/MyTasks';
import Team from '../app/pages/Team';
import Profile from '../app/pages/Profile';
import Calendar from '../app/pages/Calendar';
import Analytics from '../app/pages/Analytics';
import Notifications from '../app/pages/Notifications';
// import TeamChat from './app/pages/TeamChat'; <--- DELETED (Obsolete)
import Automations from '../app/pages/Automations';
import Timesheets from '../app/pages/Timesheets';
import Messages from '../app/pages/Messages';

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <ModernHeader onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <ModernSidebar 
            isOpen={isMobileMenuOpen} 
            onClose={() => setIsMobileMenuOpen(false)} 
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full">
           <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}

            {/* Protected Routes */}
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} /> {/* Redirect root to Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Work */}
                <Route path="/tasks" element={<MyTasks />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/timesheets" element={<Timesheets />} />
                
                {/* Communication */}
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/messages/:roomId" element={<Messages />} /> {/* ONE Chat Route */}
                
                {/* Management */}
                <Route path="/team" element={<Team />} />
                
                {/* FIXED: Two Profile Routes (Me vs Others) */}
                <Route path="/profile" element={<Profile />} /> 
                <Route path="/profile/:id" element={<Profile />} />
                
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/automations" element={<Automations />} />
                <Route path="/analytics" element={<Analytics />} />
                
                {/* Settings */}
                <Route path="/settings" element={<SettingsLayout />} />
              </Route>
            </Route>

          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}