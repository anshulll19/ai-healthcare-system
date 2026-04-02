import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './Dashboard';
import Auth from './Auth';
import AdminDashboard from './AdminDashboard';
import Logs from './Logs';
import ALSCommunicationPage from './pages/ALSCommunicationPage';
import ALSSymptomTrackerPage from './pages/ALSSymptomTrackerPage';
import CaregiverDashboard from './pages/CaregiverDashboard';
import HealthEducation from './pages/HealthEducation';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userRole = localStorage.getItem('user_role');
    if (userRole) {
      setIsAuthenticated(true);
      setRole(userRole);
    }
  }, []);

  const handleLogin = (r: string) => {
    setIsAuthenticated(true);
    setRole(r);
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  const isCaregiver = role === 'admin' || role === 'caregiver';

  return (
    <Routes>
      <Route path="/" element={<Layout role={role} />}>
        {/* Patient routes */}
        {!isCaregiver && (
          <>
            <Route index element={<Dashboard />} />
            <Route path="communicate" element={<ALSCommunicationPage />} />
            <Route path="symptoms" element={<ALSSymptomTrackerPage />} />
            <Route path="education" element={<HealthEducation />} />
          </>
        )}

        {/* Caregiver / Admin routes */}
        {isCaregiver && (
          <>
            <Route index element={<CaregiverDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="logs" element={<Logs />} />
          </>
        )}

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
