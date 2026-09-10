import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminAddInventory } from './pages/admin/AdminAddInventory';
import { AdminSales } from './pages/admin/AdminSales';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminCustomerDetail } from './pages/admin/AdminCustomerDetail';
import { AdminCategories } from './pages/admin/AdminCategories';

import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffSales } from './pages/staff/StaffSales';
import { StaffMySales } from './pages/staff/StaffMySales';

// Public pages
import { ShopPage } from './pages/public/ShopPage';
import { ProductDetailPage } from './pages/public/ProductDetailPage';

// Root redirect handler based on user role
const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/staff/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/:id" element={<ProductDetailPage />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRole="ADMIN">
                  <AppLayout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="inventory" element={<AdminInventory />} />
                      <Route path="inventory/new" element={<AdminAddInventory />} />
                      <Route path="sales" element={<AdminSales />} />
                      <Route path="customers" element={<AdminCustomers />} />
                      <Route path="customers/:id" element={<AdminCustomerDetail />} />
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Staff Protected Routes */}
            <Route
              path="/staff/*"
              element={
                <ProtectedRoute allowedRole="STAFF">
                  <AppLayout>
                    <Routes>
                      <Route path="dashboard" element={<StaffDashboard />} />
                      <Route path="sales" element={<StaffSales />} />
                      <Route path="my-sales" element={<StaffMySales />} />
                      <Route path="*" element={<Navigate to="/staff/dashboard" replace />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
