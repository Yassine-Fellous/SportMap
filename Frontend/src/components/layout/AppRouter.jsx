import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner } from '../ui';
import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';

// Lazy loading des pages
const HomePage = React.lazy(() => import('../../pages/HomePage'));
const MapPage = React.lazy(() => import('../../pages/MapPage'));
const SportsPage = React.lazy(() => import('../../pages/SportsPage'));
const AboutPage = React.lazy(() => import('../../pages/AboutPage'));
const ReportPage = React.lazy(() => import('../../pages/ReportPage'));
const VerificationPage = React.lazy(() => import('../../pages/VerificationPage'));
const DashboardPage = React.lazy(() => import('../../pages/DashboardPage'));
const ForgotPasswordPage = React.lazy(() => import('../../pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('../../pages/ResetPasswordPage'));

const AppRouter = () => {
  return (
    <main className="flex-1 flex flex-col">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Pages publiques */}
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/sports" element={<SportsPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Authentication routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/verification" element={<VerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Pages protégées */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/report" element={<ReportPage />} />

          {/* Redirections */}
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </main>
  );
};

export default AppRouter;