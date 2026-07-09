import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { HCPListPage } from "../pages/HCP/HCPListPage";
import { HCPNewPage } from "../pages/HCP/HCPNewPage";
import { HCPProfilePage } from "../pages/HCP/HCPProfilePage";
import { ForgotPasswordPage } from "../pages/Login/ForgotPasswordPage";
import { LoginPage } from "../pages/Login/LoginPage";
import { LogInteractionPage } from "../pages/Interaction/LogInteractionPage";
import { SettingsPage } from "../pages/Settings/SettingsPage";

export const AppRoutes = () => (
  <Routes>
    <Route element={<LoginPage />} path="/login" />
    <Route element={<ForgotPasswordPage />} path="/forgot-password" />
    <Route element={<AppLayout />}>
      <Route element={<Navigate to="/dashboard" replace />} path="/" />
      <Route element={<DashboardPage />} path="/dashboard" />
      <Route element={<HCPListPage />} path="/hcp" />
      <Route element={<HCPNewPage />} path="/hcp/new" />
      <Route element={<HCPProfilePage />} path="/hcp/:doctorId" />
      <Route element={<LogInteractionPage />} path="/interactions/new" />
      <Route element={<SettingsPage />} path="/settings" />
    </Route>
    <Route element={<Navigate to="/dashboard" replace />} path="*" />
  </Routes>
);
