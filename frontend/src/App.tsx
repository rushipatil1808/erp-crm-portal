import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { ChallansPage } from './pages/ChallansPage';
import './styles/index.css';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--erp-bg-app)',
          fontSize: '1rem',
          color: 'var(--erp-text-muted)',
        }}
      >
        Initializing ERP + CRM Operations Portal...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  switch (currentPage) {
    case 'customers':
      return <CustomersPage onNavigate={setCurrentPage} />;
    case 'products':
      return <ProductsPage onNavigate={setCurrentPage} defaultTab="catalog" />;
    case 'stock-logs':
      return <ProductsPage onNavigate={setCurrentPage} defaultTab="audit" />;
    case 'challans':
      return <ChallansPage onNavigate={setCurrentPage} />;
    case 'dashboard':
    default:
      return <DashboardPage onNavigate={setCurrentPage} />;
  }
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
