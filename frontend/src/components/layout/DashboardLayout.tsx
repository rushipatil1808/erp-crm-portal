import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  title: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentPage,
  onNavigate,
  title,
  children,
}) => {
  return (
    <div className="app-container">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="main-content">
        <Header title={title} />
        <main className="content-body">{children}</main>
      </div>
    </div>
  );
};
