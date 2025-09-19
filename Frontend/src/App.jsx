import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Navigation from './layouts/Navigation';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { ROUTES } from './constants/routes';

// ✅ LAZY LOAD TOUS LES COMPOSANTS DE PAGES
const MapView = lazy(() => import('./components/Map/MapView'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const SportsPage = lazy(() => import('./pages/SportsPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const ReportSuccessPage = lazy(() => import('./pages/ReportSuccessPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const VerificationPage = lazy(() => import('./pages/VerificationPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

// ✅ AJOUTER CES IMPORTS LAZY
const LoginForm = lazy(() => import('./components/auth/LoginForm'));
const RegisterForm = lazy(() => import('./components/auth/RegisterForm'));

// Composant de loading
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Styles
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}