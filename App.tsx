
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { MasterAdminDashboard } from './pages/MasterAdminDashboard';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { PublicBookingPage } from './pages/PublicBookingPage';
import { LoginPage } from './pages/LoginPage';
import { Provider, Appointment, User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('nezam_user');
      if (saved && saved !== 'undefined') return JSON.parse(saved);
      return null;
    } catch (e) {
      return null;
    }
  });

  const [providers, setProviders] = useState<Provider[]>(() => {
    try {
      const saved = localStorage.getItem('nezam_providers');
      if (saved && saved !== 'undefined') return JSON.parse(saved);
      return [];
    } catch (e) {
      return [];
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('nezam_appointments');
      if (saved && saved !== 'undefined') return JSON.parse(saved);
      return [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('nezam_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('nezam_providers', JSON.stringify(providers));
  }, [providers]);

  useEffect(() => {
    localStorage.setItem('nezam_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={<LoginPage onLogin={setCurrentUser} />} 
        />
        
        <Route 
          path="/admin/*" 
          element={
            currentUser?.role === 'admin' ? (
              <Layout user={currentUser} onLogout={handleLogout}>
                <MasterAdminDashboard 
                  providers={providers} 
                  setProviders={setProviders} 
                />
              </Layout>
            ) : <Navigate to="/login" />
          } 
        />

        <Route 
          path="/dashboard/*" 
          element={
            currentUser?.role === 'provider' ? (
              <Layout user={currentUser} onLogout={handleLogout}>
                <ProviderDashboard 
                  providerId={currentUser.providerId!} 
                  appointments={appointments}
                  setAppointments={setAppointments}
                  providers={providers}
                  setProviders={setProviders}
                />
              </Layout>
            ) : <Navigate to="/login" />
          } 
        />

        <Route 
          path="/p/:slug" 
          element={
            <PublicBookingPage 
              providers={providers} 
              appointments={appointments}
              setAppointments={setAppointments}
            />
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
