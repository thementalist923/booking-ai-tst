
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
    const saved = localStorage.getItem('nezam_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [providers, setProviders] = useState<Provider[]>(() => {
    const saved = localStorage.getItem('nezam_providers');
    return saved ? JSON.parse(saved) : [];
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('nezam_appointments');
    return saved ? JSON.parse(saved) : [];
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
        
        {/* Master Admin Routes */}
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

        {/* Provider Routes */}
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

        {/* Public Booking Pages */}
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
      </Routes>
    </HashRouter>
  );
};

export default App;
