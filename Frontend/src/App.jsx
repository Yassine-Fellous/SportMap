import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Navigation from './layouts/Navigation';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { ROUTES } from './constants/routes';

// Import centralisé des pages
import {
  HomePage,
  AboutPage,
  SportsPage,
  ReportPage,
  DashboardPage,
  AuthPage,
  VerificationPage,
  ForgotPasswordPage,
  ResetPasswordPage
} from './pages';

// Import des composants Map et Auth
import MapView from './components/Map/MapView';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ReportSuccessPage from './pages/ReportSuccessPage';

// Styles
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Route spéciale pour la carte SANS navigation */}
          <Route 
            path={ROUTES.MAP} 
            element={
              <div style={{ height: '100vh', overflow: 'hidden' }}>
                {/* ✅ SUPPRIMER LA NAVIGATION SUR LA PAGE CARTE */}
                <MapView />
              </div>
            } 
          />
          
          {/* Toutes les autres routes avec layout normal */}
          <Route path="/*" element={
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-grow">
                <Routes>
                  <Route path={ROUTES.HOME} element={<HomePage />} />
                  <Route path={ROUTES.ABOUT} element={<AboutPage />} />
                  <Route path={ROUTES.SPORTS} element={<SportsPage />} />
                  <Route path={ROUTES.REPORT} element={<ReportPage />} />
                  <Route path={ROUTES.REPORT_SUCCESS} element={<ReportSuccessPage />} />
                  <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                  <Route path={ROUTES.LOGIN} element={<LoginForm />} />
                  <Route path={ROUTES.REGISTER} element={<RegisterForm />} />
                  <Route path={ROUTES.VERIFICATION} element={<VerificationPage />} />
                  <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                  <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
                  <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}