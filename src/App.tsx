import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeadsListPage from './pages/LeadsListPage';
import LeadDetailPage from './pages/LeadDetailPage';
import SingleLeadFormPage from './pages/SingleLeadFormPage';
import BulkUploadPage from './pages/BulkUploadPage';
import ExportPage from './pages/ExportPage';
import AffiliatesListPage from './pages/AffiliatesListPage';
import AffiliateDetailPage from './pages/AffiliateDetailPage';
import ApiIntegrationPage from './pages/ApiIntegrationPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#FFFFFF',
            color: '#1F2937',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="leads" element={<LeadsListPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="add-lead" element={<SingleLeadFormPage />} />
          <Route path="bulk-upload" element={<BulkUploadPage />} />
          <Route path="export" element={<ExportPage />} />
          <Route path="affiliates" element={<AffiliatesListPage />} />
          <Route path="affiliates/:id" element={<AffiliateDetailPage />} />
          <Route path="api-integration" element={<ApiIntegrationPage />} />
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;