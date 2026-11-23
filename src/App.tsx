import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { AttendanceProvider } from './contexts/AttendanceContext';
import { Layout } from './layouts/Layout';
import { Dashboard } from './pages/Dashboard';
import { Subjects } from './pages/Subjects';
import { Attendance } from './pages/Attendance';
import { Timetable } from './pages/Timetable';
import { CalendarView } from './pages/CalendarView';
import { LandingPage } from './pages/LandingPage';
import { Analytics } from './pages/Analytics';
import { SettingsPage } from './pages/SettingsPage';
import { SplashScreen } from './components/SplashScreen';

export function App() {
  const isNative = Capacitor.isNativePlatform();
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AttendanceProvider>
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} minDurationMs={2000} />
      )}
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={isNative ? <Navigate to="/dashboard" replace /> : <LandingPage />}
            />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AttendanceProvider>
  );
}

export default App;
