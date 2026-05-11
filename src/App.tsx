import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import StaffHomePage from './pages/staff/StaffHomePage';
import StaffNewPage from './pages/staff/StaffNewPage';
import StaffListPage from './pages/staff/StaffListPage';
import StaffDetailPage from './pages/staff/StaffDetailPage';
import StaffRatePage from './pages/staff/StaffRatePage';
import TechnicianListPage from './pages/staff/TechnicianListPage';

import TechQueuePage from './pages/tech/TechQueuePage';
import TechDetailPage from './pages/tech/TechDetailPage';
import TechUpdatePage from './pages/tech/TechUpdatePage';

import AdminLayout from './components/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminBoardPage from './pages/admin/AdminBoardPage';
import AdminTechniciansPage from './pages/admin/AdminTechniciansPage';
import AdminNewTicketPage from './pages/admin/AdminNewTicketPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/staff/home" replace />} />

    {/* Staff */}
    <Route path="/staff/home" element={<StaffHomePage />} />
    <Route path="/staff/new" element={<StaffNewPage />} />
    <Route path="/staff/list" element={<StaffListPage />} />
    <Route path="/staff/ticket/:id" element={<StaffDetailPage />} />
    <Route path="/staff/ticket/:id/rate" element={<StaffRatePage />} />
    <Route path="/staff/technicians" element={<TechnicianListPage />} />
    {/* Tech */}
    <Route path="/tech/queue" element={<TechQueuePage />} />
    <Route path="/tech/ticket/:id" element={<TechDetailPage />} />
    <Route path="/tech/ticket/:id/update" element={<TechUpdatePage />} />
    <Route path="/tech" element={<Navigate to="/tech/queue" replace />} />

    {/* Admin */}
    <Route path="/admin-login" element={<AdminLoginPage />} />
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboardPage />} />
      <Route path="board" element={<AdminBoardPage />} />
      <Route path="technicians" element={<AdminTechniciansPage />} />
      <Route path="new" element={<AdminNewTicketPage />} />
      <Route path="settings" element={<AdminSettingsPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/staff/home" replace />} />
  </Routes>
);

const App: React.FC = () => (
  <AppProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AppProvider>
);

export default App;
