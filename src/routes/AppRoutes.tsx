import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { useData } from '../hooks/useData';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { PublicBuildingPage } from '../pages/PublicBuildingPage';

import { DashboardPage } from '../pages/DashboardPage';
import { BuildingsPage } from '../pages/BuildingsPage';
import { BuildingDetailPage } from '../pages/BuildingDetailPage';
import { BuildingFloorsPage } from '../pages/BuildingFloorsPage';
import { InspectionsPage } from '../pages/InspectionsPage';
import { DrillsPage } from '../pages/DrillsPage';
import { DrillDetailPage } from '../pages/DrillDetailPage';
import { IssuesPage } from '../pages/IssuesPage';
import { ReportsPage } from '../pages/ReportsPage';
import { StaffPage } from '../pages/StaffPage';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useData();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const AppRoutes: React.FC = () => {
  const { user } = useData();

  return (
    <Routes>
      {/* Public Pages with PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Public Mobile-Friendly Building Emergency Pages (stand-alone high-contrast layout) */}
      <Route path="/building/:slug" element={<PublicBuildingPage />} />
      <Route path="/emergency/:buildingId" element={<PublicBuildingPage />} />

      {/* Authenticated Administrator Application Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/buildings" element={<BuildingsPage />} />
        <Route path="/buildings/:id" element={<BuildingDetailPage />} />
        <Route path="/buildings/:id/floors" element={<BuildingFloorsPage />} />
        <Route path="/inspections" element={<InspectionsPage />} />
        <Route path="/drills" element={<DrillsPage />} />
        <Route path="/drills/:id" element={<DrillDetailPage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/actions" element={<IssuesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/staff" element={<StaffPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
};
